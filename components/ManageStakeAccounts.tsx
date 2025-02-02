import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getDelayedUnstakeTickets } from "../solana/solistic/getters/getDelayedUnstakeTickets";
import { claim } from "../solana/solistic/instructions/claim";
import { useConnection } from "@solana/wallet-adapter-react";
import ErrorMessage from "./ErrorMessage";
import { initConfig } from "../solana/solistic/initConfig";
import TransactionSuccess from "./TransactionSuccess";

const ManageStakeAccounts = ({ onClose }) => {
  const { publicKey, wallet, connected } = useWallet();
  const { connection } = useConnection();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successSignature, setSuccessSignature] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      if (!publicKey || !connected) return;
      try {
        const { program } = initConfig(wallet, publicKey);
        const unstakeTickets = await getDelayedUnstakeTickets(program, publicKey);
        setTickets(unstakeTickets);
        console.log(unstakeTickets);
        
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setErrorMessage("Failed to fetch unstake tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [publicKey, connected, wallet]);

  const handleClaim = async (ticketAccount) => {
    if (!publicKey || !connected || !wallet?.adapter) {
      setErrorMessage("Please connect your wallet");
      return;
    }
  
    try {
      setErrorMessage("");
      setSuccessSignature("");
      setLoading(true);
  
      const ticketAccountPubkey = ticketAccount instanceof PublicKey 
        ? ticketAccount 
        : new PublicKey(ticketAccount);
  
      const wrappedSendTransaction = async (transaction, connection, options = {}) => {
        if (!wallet.adapter.sendTransaction) {
          throw new Error("Wallet does not support transaction sending");
        }
        return await wallet.adapter.sendTransaction(transaction, connection, options);
      };
  
      const signature = await claim(
        ticketAccountPubkey,
        publicKey,
        wallet,
        wrappedSendTransaction,
        connected,
        true
      );
  
      setSuccessSignature(signature);
      
      // Remove the claimed ticket from the UI immediately
      setTickets(prevTickets => 
        prevTickets.filter(ticket => 
          ticket.ticketAccount.toString() !== ticketAccount.toString()
        )
      );
  
    } catch (error) {
      console.error("Claim error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to process claim");
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
    if (successSignature) {
      const refreshTickets = async () => {
        if (!publicKey || !connected) return;
        try {
          // Wait for 2 seconds to ensure backend has processed the change
          await new Promise(resolve => setTimeout(resolve, 15000));
          
          const { program } = initConfig(wallet, publicKey);
          const unstakeTickets = await getDelayedUnstakeTickets(program, publicKey);
          setTickets(unstakeTickets);
        } catch (error) {
          console.error("Error refreshing tickets:", error);
          setErrorMessage("Failed to refresh unstake tickets");
        }
      };
  
      refreshTickets();
    }
  }, [successSignature, publicKey, connected, wallet]);
  

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

          <h2 className="text-3xl text-[#1F0B35] mb-6 dark:text-[#F8EBD0] text-center">
            Manage Your Stake Accounts
          </h2>
          <p className="text-[#1F0B35] mb-6 dark:text-[#F8EBD0] text-center text-lg">
            View, deactivate, and withdraw your non-sSOL stake accounts
          </p>
          <p className="text-[#1F0B35] dark:text-[#F8EBD0]">
            This dashboard allows you to manage your individual Solana stake accounts. In the
            <span className="font-bold"> "Active Stake"</span> section, you can click to deactivate stakes, causing the stake to transition to
            <span className="font-bold"> "Deactivating Stake"</span> state. At the start of the next epoch, this stake will move to the
            <span className="font-bold"> "Inactive Stake"</span> section. Once inactive, you can click to immediately withdraw your SOL tokens.
          </p>
          <p className="text-[#1F0B35] mt-4 dark:text-[#F8EBD0]">
            Your sSOL stake pool positions will not appear in this list, and actions taken here do not affect your sSOL stake pool tokens. To stake or unstake sSOL, please visit the stake/unstake tab.
          </p>

          <div className="bg-[#E6E6FF] dark:bg-[#2A2A2A] mt-8 p-6 rounded-xl">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-[#6F5DA8] dark:text-[#F8EBD0]">Loading...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center text-[#6F5DA8] dark:text-[#F8EBD0]">No unstake tickets found</div>
              ) : (
                tickets.map((ticket, index) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-lg shadow">
                    <div className="flex items-center space-x-3">
                      <img src="/sol-icon.png" alt="SOL" className="w-8 h-8" />
                      <span className="text-black dark:text-[#F8EBD0] p-2 rounded-full font-bold text-lg">
                        {(ticket.lamportsAmount / LAMPORTS_PER_SOL).toFixed(6)} SOL
                      </span>
                    </div>
                    <button 
                      onClick={() => handleClaim(ticket.ticketAccount)}
                      className="bg-[#6F5DA8] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Claim'}
                    </button>
                  </div>
                ))
              )}
              {errorMessage && (
                <ErrorMessage
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
              )}
            </div>
          </div>
        </div>
      </div>

      {successSignature && (
        <TransactionSuccess
          successSignature={successSignature}
          setSuccessSignature={setSuccessSignature}
        />
      )}
    </div>
  );
};

export default ManageStakeAccounts;
