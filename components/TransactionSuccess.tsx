"use client";
import React, { useState } from "react";
import { FiExternalLink } from "react-icons/fi";

type TTrxSuccess = {
  successSignature: string;
  setSuccessSignature: (value: string) => void;
};

const TransactionSuccess = ({
  successSignature,
  setSuccessSignature,
}: TTrxSuccess) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(successSignature);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset "Copied" after 2 seconds
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-[#181818] shadow-lg rounded-lg p-5 w-96 text-center">
        <h2 className="text-2xl text-start font-bold text-[#1F0B35] dark:text-[#F8EBD0]">
          Transaction successful!
        </h2>
        <p className="mt-4 text-start text-sm text-[#181818] dark:text-[#F8EBD0] break-all">
          <strong>Signature</strong>
          <br />
          <a
            href={`https://solscan.io/tx/${successSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3A3A3A] dark:text-[#F8EBD0] underline flex items-center"
          >
            {successSignature}
            <FiExternalLink className="ml-1" />
          </a>
        </p>
        {/* Buttons placed to the right */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            className={`px-4 py-2 rounded-full border border-gray-700 dark:border-[#F8EBD0] ${
              isCopied
                ? "text-[#65558F] dark:text-[#F8EBD0]"
                : "text-[#65558F] dark:text-[#F8EBD0]"
            } text-sm transition`}
            onClick={handleCopy}
          >
            {isCopied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => setSuccessSignature("")}
            className="px-4 py-2 rounded-full bg-[#65558F] text-white text-sm transition"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionSuccess;
