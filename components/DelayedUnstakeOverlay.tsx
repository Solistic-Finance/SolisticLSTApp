import React from "react";
import { FiX } from "react-icons/fi";

const DelayedUnstakeOverlay = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#F0EEFF] dark:bg-[#202020] p-6 rounded-3xl shadow-lg w-full max-w-7xl mx-auto py-10">
        <div className="relative w-full h-auto overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
          <h2 className="text-3xl text-[#1F0B35] mb-4 dark:text-[#F8EBD0]">
            Delayed Unstake
          </h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="diamond-number">
                <span className="text-[#6F5DA8] dark:text-[#F8EBD0]">1</span>
              </div>
              <div className="font-poppins">
                <p className="font-semibold text-[#1F0B35] dark:text-[#F8EBD0]">
                  Initiate the unstaking process.
                </p>
                <p className="text-[#1F0B35] dark:text-[#F8EBD0]">
                  This will transfer your stake from the pool to a stake account
                  in your wallet.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="diamond-number">
                <span className="text-[#6F5DA8] dark:text-[#F8EBD0]">2</span>
              </div>
              <div className="font-poppins">
                <p className="font-semibold text-[#1F0B35] dark:text-[#F8EBD0]">
                  Manually deactivate your stake account by clicking on the
                  "Deactivate" button on the
                  <a href="/manage" className="text-[#6F5DA8]">
                    {" "}
                    Manage Stake Accounts
                  </a>{" "}
                  page or in your wallet.
                </p>
                <p className="text-[#1F0B35] dark:text-[#F8EBD0]">
                  Your stake will be available at the next epoch boundary,
                  approximately at Nov 8, 2024, 11:31 PM. Your funds will remain
                  locked until that time.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3">
              <div className="diamond-number">
                <span className="text-[#6F5DA8] dark:text-[#F8EBD0]">3</span>
              </div>
              <div className="font-poppins">
                <p className="font-semibold text-[#1F0B35] dark:text-[#F8EBD0]">
                  Once your stake has finished deactivating, click on the
                  "Withdraw" button to withdraw SOL to your wallet.
                </p>
                <p className="text-[#1F0B35] dark:text-[#F8EBD0]">
                  After the SOL is withdrawn to your wallet, it can be moved
                  around freely.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[#1F0B35] mt-4 dark:text-[#F8EBD0]">
            <span className="font-bold">NOTE:</span> This action is
            irreversible. Once initiated, Solistic will remove your stake from
            the stake pool. For a detailed walkthrough, refer to our specific
            wallet guides:{" "}
            <a href="#" className="text-[#6F5DA8] font-bold underline">
              Phantom Wallet Guide
            </a>
            ,{" "}
            <a href="#" className="text-[#6F5DA8] font-bold underline">
              Solflare Wallet Guide
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default DelayedUnstakeOverlay;
