// import { Client } from 'dwolla-v2';

// let dwolla: Client;

// try {
//   if (!process.env.DWOLLA_APP_KEY) {
//     throw new Error('DWOLLA_APP_KEY is not set in environment variables');
//   }
//   if (!process.env.DWOLLA_APP_SECRET) {
//     throw new Error('DWOLLA_APP_SECRET is not set in environment variables');
//   }

//   dwolla = new Client({
//     key: process.env.DWOLLA_APP_KEY,
//     secret: process.env.DWOLLA_APP_SECRET,
//     environment: process.env.DWOLLA_ENV === 'production' ? 'production' : 'sandbox',
//   });
// } catch (error) {
//   console.error('Error initializing Dwolla client:', error);
// }

// export const createDwollaCustomer = async (customerData: any) => {
//   if (!dwolla) {
//     throw new Error('Dwolla client is not initialized. Check your environment variables.');
//   }

//   try {
//     console.log('Creating Dwolla customer with data:', JSON.stringify(customerData, null, 2));

//     const requestBody = {
//       firstName: customerData.firstName,
//       lastName: customerData.lastName,
//       email: customerData.email,
//       type: customerData.type,
//       address1: customerData.address1,
//       city: customerData.city,
//       state: customerData.state,
//       postalCode: customerData.postalCode,
//       dateOfBirth: customerData.dateOfBirth,
//       ssn: customerData.ssn,
//     };

//     const response = await dwolla.post('customers', requestBody);
//     console.log('Dwolla customer created successfully:', response.headers.get('location'));
//     return response.headers.get('location');
//   } catch (error: any) {
//     console.error('Error creating Dwolla customer:', error);
//     if (error.body) {
//       console.error('Dwolla error details:', JSON.stringify(error.body, null, 2));
//     }
//     throw new Error(`Dwolla customer creation failed: ${error.message}`);
//   }
// };

// export const addFundingSource = async ({
//   dwollaCustomerId,
//   processorToken,
//   bankName,
// }: addFundingSourceProps) => {
//   try {
//     console.log('Adding funding source for customer:', dwollaCustomerId);
//     const response = await dwollaClient.post(`customers/${dwollaCustomerId}/funding-sources`, {
//       plaidToken: processorToken,
//       name: bankName,
//     });
//     console.log('Funding source added successfully:', response.headers.get('location'));
//     return response.headers.get('location');
//   } catch (error) {
//     console.error('Error adding funding source:', error);
//     if (error.body) {
//       console.error('Dwolla error details:', JSON.stringify(error.body, null, 2));
//     }
//     throw new Error(`Adding funding source failed: ${JSON.stringify(error)}`);
//   }
// };


"use server";

import { Client } from "dwolla-v2";

const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        "Dwolla environment should either be set to `sandbox` or `production`"
      );
  }
};

const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions
): Promise<string | undefined> => {
  try {
    const response = await dwollaClient.post(`customers/${options.customerId}/funding-sources`, {
      name: options.fundingSourceName,
      plaidToken: options.processorToken,
    });
    return response.headers.get("location");
  } catch (err) {
    console.error("Creating a Funding Source Failed: ", err);
    throw err;
  }
};

export const createOnDemandAuthorization = async (): Promise<any> => {
  try {
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations"
    );
    return onDemandAuthorization.body._links;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
    throw err;
  }
};

export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
): Promise<string | undefined> => {
  try {
    const response = await dwollaClient.post("customers", newCustomer);
    return response.headers.get("location");
  } catch (err) {
    console.error("Creating a Dwolla Customer Failed: ", err);
    throw err;
  }
};

export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams): Promise<string | undefined> => {
  try {
    const requestBody = {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: amount,
      },
    };
    const response = await dwollaClient.post("transfers", requestBody);
    return response.headers.get("location");
  } catch (err) {
    console.error("Transfer fund failed: ", err);
    throw err;
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams): Promise<string | undefined> => {
  try {
    // create dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // add funding source to the dwolla customer & get the funding source url
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      processorToken: processorToken,
    };
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Adding funding source failed: ", err);
    throw err;
  }
};