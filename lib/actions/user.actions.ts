'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { LinkTokenCreateRequest, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum } from "plaid";
import { plaidClient } from '@/lib/plaid';
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";
import { redirect } from "next/navigation";

const {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID,
} = process.env;

interface User {
  $id: string;
  email: string;
  firstName: string;
  lastName: string;
  dwollaCustomerId: string;
}

interface DwollaCustomer {
  location: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface SignUpProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface SignInProps {
  email: string;
  password: string;
}

interface GetUserInfoProps {
  userId: string;
}

interface ExchangePublicTokenProps {
  publicToken: string;
  user: User;
}

export async function getUserInfo({ userId }: GetUserInfoProps) {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_USER_COLLECTION_ID!,
      [Query.equal('$id', [userId])]
    );

    if (user.documents.length === 0) {
      console.log(`No user found for userId: ${userId}`);
      return null;
    }

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error('Error in getUserInfo:', error);
    return null;
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();
    const user = await getUserInfo({ userId: result.$id });

    if (!user) {
      // Clear session and redirect to sign-in
      const cookieStore = cookies();
      cookieStore.delete('appwrite-session');
      redirect('/sign-in?error=no_user');
    }

    return user;
  } catch (error) {
    console.error('Error in getLoggedInUser:', error);
    return null;
  }
}

export async function signUp({ email, password, firstName, lastName }: SignUpProps) {
  try {
    const { account, database } = await createAdminClient();

    const newUser = await account.create(ID.unique(), email, password, firstName);

    const dwollaCustomer = (await createDwollaCustomer({
      firstName,
      lastName,
      email,
      type: 'personal',
      address1: '',
      city: '',
      state: '',
      postalCode: '',
      dateOfBirth: '',
      ssn: ''
    })) as unknown as DwollaCustomer;

    if (!dwollaCustomer || !dwollaCustomer.location) {
      throw new Error('Failed to create Dwolla customer');
    }

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomer.location);

    const user = await database.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_USER_COLLECTION_ID!,
      newUser.$id,
      {
        email,
        firstName,
        lastName,
        dwollaCustomerId,
      }
    );

    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return { success: true, user };
  } catch (error) {
    console.error('Error in signUp:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function signIn({ email, password }: SignInProps) {
  try {
    console.log(`Attempting to sign in user: ${email}`);
    const { account } = await createAdminClient();
    
    const session = await account.createEmailPasswordSession(email, password);
    console.log('Session created successfully:', session.$id);

    const cookieStore = cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId });
    console.log('User info retrieved:', user ? 'success' : 'null');

    if (!user) {
      console.log(`User not found for userId: ${session.userId}`);
      return { success: false, error: "User not found in database" };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error in signIn:', error);
    if (error instanceof Error) {
      console.error('Error details:', error);
      if ('code' in error && error.code === 401) {
        return { success: false, error: "Invalid credentials. Please check the email and password." };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function logoutAccount() {
  try {
    const { account } = await createSessionClient();
    const cookieStore = cookies();
    cookieStore.delete('appwrite-session');
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}

export const createLinkToken = async (user: User) => {
  try {
    const request: LinkTokenCreateRequest = {
      user: {
        client_user_id: user.$id,
      },
      client_name: 'Your App Name',
      products: ['auth'],
      country_codes: ['US'],
      language: 'en',
    } as LinkTokenCreateRequest;

    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    return { linkToken: createTokenResponse.data.link_token };
  } catch (error) {
    console.error('Error creating link token:', error);
    return { error: 'Failed to create link token' };
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: ExchangePublicTokenProps) => {
  try {
    console.log('Exchanging public token for user:', user.$id);

    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    
    console.log('Received access token and item ID');

    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    console.log('Retrieved account data:', accountData);

    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    console.log('Created processor token for Dwolla');

    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) {
      throw new Error('Failed to create funding source');
    }

    console.log('Created funding source URL:', fundingSourceUrl);

    const { database } = await createAdminClient();

    const newBank = await database.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId: user.$id,
        accessToken: encryptId(accessToken),
        itemId,
        accountId: accountData.account_id,
        name: accountData.name,
        officialName: accountData.official_name,
        type: accountData.type,
        subtype: accountData.subtype,
        mask: accountData.mask,
        fundingSourceUrl,
      }
    );

    console.log('Created new bank document:', newBank);

    revalidatePath('/');

    return parseStringify(newBank);
  } catch (error) {
    console.error('Error exchanging public token:', error);
    if (error instanceof Error) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { error_code?: string } } };
        if (apiError.response?.status === 400 && apiError.response?.data?.error_code === 'INVALID_PRODUCT') {
          throw new Error('Dwolla integration is not enabled for your Plaid API keys. Please enable it in the Plaid Dashboard.');
        }
      }
      throw error;
    }
    throw new Error('An unexpected error occurred while exchanging public token');
  }
};

export const getBanks = async ({ userId }: { userId: string }) => {
  try {
    const { database } = await createAdminClient();
    const banks = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal('userId', userId)]
    );
    console.log('Retrieved banks from database:', banks);
    return banks.documents;
  } catch (error) {
    console.error('Error fetching banks:', error);
    return [];
  }
};

export const getBank = async ({ documentId }: { documentId: string }) => {
  try {
    const { database } = await createAdminClient();
    const bank = await database.getDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      documentId
    );
    console.log('Retrieved bank from database:', bank);
    return bank;
  } catch (error) {
    console.error('Error fetching bank:', error);
    return null;
  }
};