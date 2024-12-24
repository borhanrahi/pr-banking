import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getBanks } from "@/lib/actions/user.actions";
import { getAllTransactions } from "@/lib/actions/bank.actions";
import React from "react";

const Home = async () => {
  const user = await getLoggedInUser();
  
  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  const banks = await getBanks({ userId: user.$id });
  const transactions = await getAllTransactions({ userId: user.$id });

  console.log('Fetched banks:', banks);
  
  const totalCurrentBalance = banks.reduce((total, bank) => total + (bank.balances?.current || 0), 0);
  
  console.log('Total current balance:', totalCurrentBalance);

  return (
    <section className='home'>
      <div className='home-content p-4'>
        <header className='home-header'>
          <HeaderBox
            type='greeting'
            title='Welcome'
            user={user.firstName || "Guest"}
            subtext='Access and manage your accounts and transactions'
          />
          <TotalBalanceBox
            accounts={banks}
            totalBanks={banks.length}
            totalCurrentBalance={totalCurrentBalance}
          />
        </header>
      </div>
      <RightSidebar
        user={user}
        transactions={transactions}
        banks={banks}
      />
    </section>
  );
};

export default Home;