import React, { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from "react-plaid-link";
import { useRouter } from "next/navigation";
import { createLinkToken, exchangePublicToken } from "@/lib/actions/user.actions";
import Image from "next/image";

interface PlaidLinkProps {
  user: any;
  variant?: string;
}

const PlaidLink: React.FC<PlaidLinkProps> = ({ user, variant }) => {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const getLinkToken = async () => {
      try {
        const token = await createLinkToken(user);
        setLinkToken(token);
      } catch (error) {
        console.error("Error creating link token:", error);
      }
    };

    getLinkToken();
  }, [user]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token, metadata) => {
      try {
        await exchangePublicToken({ publicToken: public_token, user });
        router.refresh();
      } catch (error) {
        console.error("Error exchanging public token:", error);
      }
    },
    [user, router]
  );

  const config: PlaidLinkOptions = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  if (!linkToken) {
    return <div>Loading Plaid Link...</div>;
  }

  return (
    <Button
      onClick={() => open()}
      disabled={!ready}
      className={`plaidlink-${variant || 'default'}`}
    >
      <Image
        src='/icons/connect-bank.svg'
        alt='connect bank'
        width={24}
        height={24}
      />
      <p className='text-[16px] font-semibold text-black-2'>Connect bank</p>
    </Button>
  );
};

export default PlaidLink;