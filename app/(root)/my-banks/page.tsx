import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox'
import { getBanks } from '@/lib/actions/user.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const MyBanks = async () => {
  const user = await getLoggedInUser();
  
  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  const banks = await getBanks({ userId: user.$id });

  return (
    <section className='flex'>
      <div className="my-banks">
        <HeaderBox 
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activities."
        />

        <div className="space-y-4">
          <h2 className="header-2">
            Your cards
          </h2>
          <div className="flex flex-wrap gap-6">
            {banks.map((bank) => (
              <BankCard 
                key={bank.$id}
                account={bank}
                userName={user.firstName}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MyBanks;