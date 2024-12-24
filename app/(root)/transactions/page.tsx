import TransactionHistory from "@/components/TransactionHistory"

export default function TransactionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      <TransactionHistory />
    </div>
  )
} 