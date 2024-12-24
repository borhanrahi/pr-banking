"use client";

import React, { useState, useEffect } from 'react';
import { usePlaidLink } from "react-plaid-link";
import Image from "next/image";

interface ConnectBankModalProps {
  linkToken: string;
  onSuccess: (public_token: string) => void;
}

const ConnectBankModal: React.FC<ConnectBankModalProps> = ({ linkToken, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = {
    token: linkToken,
    onSuccess: (public_token: string) => {
      onSuccess(public_token);
      setIsOpen(false);
    },
    onExit: () => {
      setError("Connection process exited. Please try again.");
    },
    onError: (err: Error) => {
      console.error(err);
      setError("An error occurred. Please try again.");
    },
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOpen && !linkToken) {
      setError("Link token is not available. Please try again later.");
    } else {
      setError(null);
    }
  }, [isOpen, linkToken]);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex gap-2 items-center">
        <Image src="/icons/plus.svg" width={20} height={20} alt="plus" />
        <span className="text-14 font-semibold">Add banks</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Connect Bank</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              onClick={() => {
                if (ready && open) {
                  open();
                } else {
                  setError("Plaid Link is not ready. Please try again.");
                }
              }}
              disabled={!ready || !linkToken}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed w-full mb-2"
            >
              {ready && linkToken ? "Connect with Plaid" : "Loading..."}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-800 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectBankModal;