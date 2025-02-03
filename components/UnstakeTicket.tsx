import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getDelayedUnstakeTickets } from "../solana/solistic/getters/getDelayedUnstakeTickets";
import { initConfig } from "../solana/solistic/initConfig";
import { claim } from "../solana/solistic/instructions/claim";
import ErrorMessage from "./ErrorMessage";
import TransactionSuccess from "./TransactionSuccess";

interface TicketState {
  ticketAccount: string;
  claimableAt: number;
}

const UnstakeTicket = () => {
  const { publicKey, wallet, connected } = useWallet();
  const { connection } = useConnection();
  const [tickets, setTickets] = useState([]);
  const [ticketStates, setTicketStates] = useState<{ [key: string]: TicketState }>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successSignature, setSuccessSignature] = useState("");
  const [processingTickets, setProcessingTickets] = useState(new Set());

  const fetchTicketState = async (ticketPubkey: string) => {
    try {
      const response = await fetch(`https://alpha-api.solistic.finance/state/unstake-ticket/${ticketPubkey}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_SOLISTIC_API_KEY
        }
      });
      if (!response.ok) throw new Error('Failed to fetch ticket state');
      const { data } = await response.json();
      return {
        ticket: data.ticket,
        claimableAt: parseInt(data.claimableTime)
      };
    } catch (error) {
      console.error("Error fetching ticket state:", error);
      return null;
    }
  };

  const fetchTickets = async () => {
    if (!publicKey || !connected) return;
    try {
      const { program } = initConfig(wallet, publicKey);
      const unstakeTickets = await getDelayedUnstakeTickets(program, publicKey);
      setTickets(unstakeTickets);

      // Fetch state for each ticket
      const states = {};
      for (const ticket of unstakeTickets) {
        const state = await fetchTicketState(ticket.ticketAccount.toString());
        if (state) {
          states[ticket.ticketAccount.toString()] = {
            ticketAccount: ticket.ticketAccount.toString(),
            claimableAt: state.claimableAt
          };
        }
      }
      setTicketStates(states);
      // console.log("Unstake Tickets:", unstakeTickets.map(ticket => ({
      //   publicKey: ticket.ticketAccount.toString(),
      // })));
      
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setErrorMessage("Failed to fetch unstake tickets");
    } finally {
      setLoading(false);
    }
  };

  // Calculate remaining time
  const getRemainingTime = (claimableAt: number) => {
    const now = Date.now();
    const remainingMs = claimableAt * 1000 - now;
    if (remainingMs <= 0) return { days: 0, hours: 0 };

    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.ceil((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours };
  };

  const isClaimable = (ticketAccount: string) => {
    const state = ticketStates[ticketAccount];
    if (!state) return false;
    return Date.now() >= state.claimableAt * 1000;
  };

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, [publicKey, connected, wallet]);

  // Poll for new tickets every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connected, wallet]);

  const handleClaim = async (ticketAccount) => {
    if (!publicKey || !connected || !wallet?.adapter) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessSignature("");
      setProcessingTickets(prev => new Set([...prev, ticketAccount.toString()]));

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

      // Check if signature is valid before setting it
      if (signature) {
        setSuccessSignature(signature);
      }
      
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
      setProcessingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketAccount.toString());
        return newSet;
      });
    }
  };

  const handleClaimAll = async () => {
    if (!publicKey || !connected || !wallet?.adapter) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessSignature("");
      
      for (const ticket of tickets) {
        await handleClaim(ticket.ticketAccount);
      }
    } catch (error) {
      console.error("Claim all error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to process claims");
    }
  };

  // Refresh tickets after successful transaction
  useEffect(() => {
    if (successSignature) {
      const refreshTickets = async () => {
        if (!publicKey || !connected) return;
        try {
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

  if (loading || tickets.length === 0) return null;

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}

      {successSignature && (
        <TransactionSuccess
          successSignature={successSignature}
          setSuccessSignature={setSuccessSignature}
        />
      )}

      <div className="w-full max-w-6xl bg-white dark:bg-[#181818] shadow-lg rounded-xl p-6 space-y-4 border border-purple-200 dark:border-[#3A3A3A] mt-2">
        <h2 className="text-3xl text-gray-800 dark:text-[#F8EBD0] mb-4">
          Delayed unstaked Solana
        </h2>
        
        <div className="space-y-3">
          {tickets.map((ticket, index) => {
            const ticketKey = ticket.ticketAccount.toString();
            const claimable = isClaimable(ticketKey);
            const ticketState = ticketStates[ticketKey];

            return (
              <div 
                key={ticketKey}
                className="flex items-center justify-between bg-[#F0EEFF] dark:bg-[#2A2A2A] rounded-xl p-4 border-[#CCBDFC] border-2 dark:border-[#3A3A3A]"
              >
                <div className="flex items-center space-x-3">
                  <img src="/sol-icon.png" alt="SOL" className="h-8 w-8 border border-[#6F5DA8] dark:border-[#F8EBD0] rounded-full" />
                  <div>
                    <div className="text-3xl font-semibold text-gray-900 dark:text-[#F8EBD0] mb-2">
                      {(ticket.lamportsAmount / LAMPORTS_PER_SOL).toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleClaim(ticketKey)}
                    disabled={!claimable || loading}
                    className={`px-6 py-2 rounded-lg font-bold transition ${
                      loading 
                        ? 'bg-purple-400 cursor-not-allowed text-[#F8EBD0]'
                        : claimable
                        ? 'bg-[#6F5DA8] text-[#F8EBD0] hover:bg-[#8B7BB5] dark:hover:bg-[#8B7BB5]'
                        : 'bg-[#6F5DA8] text-[#F8EBD0]'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : claimable ? (
                      'Claim'
                    ) : ticketState ? (
                      (() => {
                        const { days, hours } = getRemainingTime(ticketState.claimableAt);
                        if (days > 0) return `${days}d`;
                        if (hours > 0) return `${hours}h`;
                        return 'Soon';
                      })()
                    ) : (
                      'Loading...'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {tickets.length > 1 && tickets.every(t => isClaimable(t.ticketAccount.toString())) && (
          <button
            onClick={handleClaimAll}
            className="w-full py-3 rounded-full text-[#F8EBD0] font-bold bg-[#6F5DA8] hover:opacity-90 transition mt-4"
          >
            Claim all
          </button>
        )}
      </div>
    </>
  );
};

export default UnstakeTicket;
