'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  relationship: string;
}

export default function BeneficiaryManagement() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: '',
    accountNumber: '',
    bankName: '',
    relationship: ''
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const response = await fetch('/api/beneficiaries');
      if (!response.ok) {
        throw new Error('Failed to fetch beneficiaries');
      }
      const data = await response.json();
      setBeneficiaries(data.beneficiaries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeneficiary = async () => {
    if (!newBeneficiary.name || !newBeneficiary.accountNumber || !newBeneficiary.bankName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBeneficiary),
      });

      if (!response.ok) {
        throw new Error('Failed to add beneficiary');
      }

      const data = await response.json();
      setBeneficiaries([...beneficiaries, data.beneficiary]);
      setNewBeneficiary({
        name: '',
        accountNumber: '',
        bankName: '',
        relationship: ''
      });
      setIsAddingNew(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add beneficiary');
    }
  };

  const handleDeleteBeneficiary = async (id: string) => {
    try {
      const response = await fetch(`/api/beneficiaries?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete beneficiary');
      }

      setBeneficiaries(beneficiaries.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete beneficiary');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 rounded-md bg-red-50">
        {error}
        <Button
          variant="outline"
          className="ml-4"
          onClick={() => setError(null)}
        >
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Beneficiaries</h2>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="bg-primary text-white"
          disabled={isAddingNew}
        >
          Add New Beneficiary
        </Button>
      </div>

      {isAddingNew && (
        <div className="bg-background p-4 rounded-lg border space-y-4">
          <h3 className="font-medium">Add New Beneficiary</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Beneficiary Name"
              value={newBeneficiary.name}
              onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
            />
            <Input
              placeholder="Account Number"
              value={newBeneficiary.accountNumber}
              onChange={(e) => setNewBeneficiary({ ...newBeneficiary, accountNumber: e.target.value })}
            />
            <Input
              placeholder="Bank Name"
              value={newBeneficiary.bankName}
              onChange={(e) => setNewBeneficiary({ ...newBeneficiary, bankName: e.target.value })}
            />
            <Input
              placeholder="Relationship"
              value={newBeneficiary.relationship}
              onChange={(e) => setNewBeneficiary({ ...newBeneficiary, relationship: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddingNew(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBeneficiary}
            >
              Save Beneficiary
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Bank Name</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {beneficiaries.map((beneficiary) => (
              <TableRow key={beneficiary.id}>
                <TableCell>{beneficiary.name}</TableCell>
                <TableCell>{beneficiary.accountNumber}</TableCell>
                <TableCell>{beneficiary.bankName}</TableCell>
                <TableCell>{beneficiary.relationship}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {beneficiaries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No beneficiaries added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 