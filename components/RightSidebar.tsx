"use client";

import Image from "next/image";
import BankCard from "./BankCard";
import { useEffect, useState } from "react";
import { createLinkToken, exchangePublicToken } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import ConnectBankModal from "./ConnectBankModal";

const RightSidebar = ({ user, transactions, banks }: RightSidebarProps) => {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState("");

  useEffect(() => {
    const getLinkToken = async () => {
      try {
        const data = await createLinkToken(user);
        if (data?.linkToken) {
          setLinkToken(data.linkToken);
        } else {
          console.error("Failed to get link token");
        }
      } catch (error) {
        console.error("Error getting link token:", error);
      }
    };

    getLinkToken();
  }, [user]);

  const onSuccess = async (public_token: string) => {
    try {
      await exchangePublicToken({
        publicToken: public_token,
        user,
      });
      router.refresh();
    } catch (error) {
      console.error("Error exchanging public token:", error);
    }
  };

  return (
    <aside className='right-sidebar'>
      <section className='flex flex-col pb-8'>
        <div className='profile-banner' />
        <div className='profile'>
          <div className='profile-img'>
            <span className='text-5xl font-bold text-blue-500'>
              {user.firstName[0]}
            </span>
          </div>
          <div className='profile-details'>
            <h1 className='profile-name'>
              {user.firstName} {user.lastName}
            </h1>
            <p className='profile-email'>{user.email}</p>
          </div>
        </div>
      </section>
      <section className='banks'>
        <div className='flex w-full justify-between mb-4'>
          <h2 className='header-2'>My Balance</h2>
          <ConnectBankModal linkToken={linkToken} onSuccess={onSuccess} />
        </div>

        <div className='relative flex flex-col gap-4'>
          {banks && banks.length > 0 ? (
            banks.map((bank, index) => (
              <div key={bank.$id} className={`relative ${index > 0 ? 'mt-[-60px]' : ''}`}>
                <BankCard
                  account={bank}
                  userName={`${user.firstName} ${user.lastName}`}
                  showBalance={false}
                />
              </div>
            ))
          ) : (
            <p>No banks connected yet.</p>
          )}
        </div>
      </section>
    </aside>
  );
};

export default RightSidebar;