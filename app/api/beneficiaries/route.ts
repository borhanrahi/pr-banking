import { NextResponse } from "next/server";

// Mock data store - replace with actual database
let beneficiaries = [
  {
    id: "1",
    name: "John Doe",
    accountNumber: "1234567890",
    bankName: "Chase Bank",
    relationship: "Friend"
  }
];

export async function GET() {
  try {
    return NextResponse.json({ beneficiaries }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch beneficiaries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBeneficiary = {
      id: Date.now().toString(),
      ...body
    };
    
    beneficiaries.push(newBeneficiary);
    
    return NextResponse.json(
      { beneficiary: newBeneficiary },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create beneficiary" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Beneficiary ID is required" },
        { status: 400 }
      );
    }

    const initialLength = beneficiaries.length;
    beneficiaries = beneficiaries.filter(b => b.id !== id);

    if (beneficiaries.length === initialLength) {
      return NextResponse.json(
        { error: "Beneficiary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Beneficiary deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete beneficiary" },
      { status: 500 }
    );
  }
} 