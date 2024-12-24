import { NextResponse } from "next/server";

// Mock data - replace with actual database calls
const transactions = [
  {
    id: "1",
    date: "2024-01-15",
    description: "Grocery Store",
    amount: 50.00,
    type: "debit",
    status: "completed"
  },
  {
    id: "2",
    date: "2024-01-14",
    description: "Salary Deposit",
    amount: 3000.00,
    type: "credit",
    status: "completed"
  },
  {
    id: "3",
    date: "2024-01-13",
    description: "Restaurant Payment",
    amount: 45.50,
    type: "debit",
    status: "completed"
  },
  {
    id: "4",
    date: "2024-01-12",
    description: "Online Shopping",
    amount: 125.99,
    type: "debit",
    status: "pending"
  },
  {
    id: "5",
    date: "2024-01-11",
    description: "Utility Bill",
    amount: 80.00,
    type: "debit",
    status: "completed"
  }
];

export async function GET() {
  try {
    // Add pagination and filtering logic here
    return NextResponse.json(
      { transactions },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
} 