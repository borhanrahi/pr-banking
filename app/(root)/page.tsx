import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";

const Home = () => {
  const loggedIn = {
    firstName: "Borhan",
    lastName: "Uddin",
    email: "borhanrahi123@gmail.com",
  };

  return (
    <section className='home'>
      <div className='home-content p-4'>
        <header className='home-header'>
          <HeaderBox
            type='greeting'
            title='Welcome'
            user={loggedIn.firstName || "Guest"}
            subtext='Access and manage your accounts and transactions'
          />
          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1000}
          />
        </header>
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={[]}
        banks={[{ currentBalance: 1550 }, { currentBalance: 2000 }]}
      />
    </section>
  );
};

export default Home;
