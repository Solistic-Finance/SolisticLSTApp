"use client";
import { useEffect, useState } from "react";
import { FaWallet, FaChevronDown } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import {
  deposit,
  unstake,
  delayedUnstake,
  getStateAccountData,
} from "../solana";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import DelayedUnstakeOverlay from "./DelayedUnstakeOverlay";
import axios from "axios";
import ErrorMessage from "./ErrorMessage";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { initConfig } from "../solana/initConfig";

type TStakeUnStake = {
  successSignature: string;
  setSuccessSignature: (value: string) => void;
};

export default function StakeUnstakeComponent({
  successSignature,
  setSuccessSignature,
}: TStakeUnStake) {
  const { sendTransaction, publicKey, connected, wallet } = useWallet();
  const [stake, setStake] = useState(true); // toggle between Stake and Unstake
  const [priorityFee, setPriorityFee] = useState(false); // toggle Priority fee
  const [showTooltip, setShowTooltip] = useState(false);
  const [selected, setSelected] = useState("0.3%");
  const options = ["0.1%", "0.2%", "0.3%"];
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState<"immediate" | "delayed">(
    "immediate"
  );
  const [solPrice, setSolPrice] = useState(0);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false); // State to toggle overlay visibility
  const [errorMessage, setErrorMessage] = useState("");
  const [balance, setBalance] = useState(0);
  const [sSolBalance, setSSolBalance] = useState("");
  const [tipsActive, setTipsActive] = useState("off"); // toggle Tips

  const handleChangeOverlay = () => {
    setIsOverlayVisible(!isOverlayVisible); // Toggle the overlay visibility
  };

  const handleUnstake = () => {
    if (selectedOption === "immediate") {
      handleUnstakeSOL();
    } else if (selectedOption === "delayed") {
      handleDelayedUnstakeSOL();
    }
  };

  const handleConvertToSSOL = async () => {
    if (
      !stakeAmount ||
      isNaN(Number(stakeAmount)) ||
      Number(stakeAmount) <= 0
    ) {
      setErrorMessage("Please enter a valid stake amount.");
      return;
    }

    try {
      if (!publicKey) {
        setErrorMessage("Please connect your wallet before proceeding.");
        return;
      }

      // Convert stakeAmount to lamports (smallest unit of SOL)
      const lamports = (Number(stakeAmount) * 1e9).toString(); // Convert SOL to lamports

      // Convert walletAddress to a PublicKey
      const userPublicKey = new PublicKey(publicKey);

      // Call the deposit function
      const transactionSig = await deposit(
        lamports,
        userPublicKey,
        wallet,
        sendTransaction,
        connected,
        priorityFee
      );
      if (transactionSig) {
        setSuccessSignature(transactionSig);
      }
    } catch (error) {
      setErrorMessage("Transaction failed.");
    } finally {
      setStakeAmount("");
    }
  };

  useEffect(() => {
    setStakeAmount("");
  }, [stake]);

  const handleUnstakeSOL = async () => {
    if (
      !stakeAmount ||
      isNaN(Number(stakeAmount)) ||
      Number(stakeAmount) <= 0
    ) {
      setErrorMessage("Please enter a valid stake amount.");
      return;
    }

    try {
      if (!publicKey) {
        setErrorMessage("Please connect your wallet before proceeding.");
        return;
      }

      // Convert stakeAmount to lamports (smallest unit of SOL)
      const lamports = (Number(stakeAmount) * 1e9).toString(); // Convert SOL to lamports

      // Convert walletAddress to a PublicKey
      const userPublicKey = new PublicKey(publicKey);

      // Call the deposit function
      const transactionSig = await unstake(
        lamports,
        userPublicKey,
        wallet,
        sendTransaction,
        connected,
        priorityFee
      );
      if (transactionSig) {
        setSuccessSignature(transactionSig);
      }
    } catch (error) {
      console.error("Error during deposit:", error);
      setErrorMessage("Transaction failed.");
    } finally {
      setStakeAmount("");
    }
  };

  const handleDelayedUnstakeSOL = async () => {
    if (
      !stakeAmount ||
      isNaN(Number(stakeAmount)) ||
      Number(stakeAmount) <= 0
    ) {
      setErrorMessage("Please enter a valid stake amount.");
      return;
    }

    try {
      if (!publicKey) {
        setErrorMessage("Please connect your wallet before proceeding.");
        return;
      }

      // Convert stakeAmount to lamports (smallest unit of SOL)
      const lamports = (Number(stakeAmount) * 1e9).toString(); // Convert SOL to lamports

      // Convert walletAddress to a PublicKey
      const userPublicKey = new PublicKey(publicKey);

      // Delayed unstake logic (you may need a different method or flag for this)
      const transactionSig = await delayedUnstake(
        lamports,
        userPublicKey,
        wallet,
        sendTransaction,
        connected,
        priorityFee
      );
      if (transactionSig) {
        setSuccessSignature(transactionSig);
      }
    } catch (error) {
      console.error("Error during delayed unstake:", error);
      setErrorMessage("Transaction failed.");
    } finally {
      setStakeAmount("");
    }
  };

  useEffect(() => {
    let intervalId;
  
    const fetchBalance = async () => {
      try {
        if (publicKey && connected && wallet) {
          const { connection } = initConfig(wallet, publicKey);
          const lamports = await connection.getBalance(publicKey);
          setBalance(lamports / LAMPORTS_PER_SOL);
        } else {
          setBalance(0);
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };
  
    // Fetch balance immediately
    fetchBalance();
  
    // Set up interval to fetch balance every 5 seconds
    if (publicKey && connected && wallet) {
      intervalId = setInterval(fetchBalance, 5000);
    }
  
    return () => {
      // Clear interval on component unmount or dependency change
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [publicKey, connected, wallet]);
  

  useEffect(() => {
    let intervalId;
  
    const fetchSolBalance = async (connection, program) => {
      try {
        if (!publicKey || !connected || !wallet) {
          setSSolBalance("0"); // Reset balance if wallet is disconnected
          return;
        }
  
        const stateAccountData = await getStateAccountData(program);
        const sSolMint = stateAccountData.ssolMint;
  
        const sSolAccount = await getAssociatedTokenAddress(
          sSolMint,
          publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
  
        const accountExists = await connection.getAccountInfo(sSolAccount);
        if (!accountExists) {
          setSSolBalance("0");
          return;
        }
  
        const sSolBalance = await connection.getTokenAccountBalance(sSolAccount);
        const sSolBalanceValue = sSolBalance.value.uiAmountString;
        setSSolBalance(sSolBalanceValue);
      } catch (error) {
        console.log("Error fetching sSol price for public Key", error);
      }
    };
  
    if (wallet) {
      const { connection, program } = initConfig(wallet, publicKey);
  
      // Fetch balance immediately
      fetchSolBalance(connection, program);
  
      // Set up interval to fetch balance every 5 seconds
      intervalId = setInterval(() => {
        fetchSolBalance(connection, program);
      }, 5000);
    } else {
      // Reset balance if wallet is disconnected
      setSSolBalance("0");
    }
  
    return () => {
      // Clear interval on component unmount or dependency change
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [publicKey, connected, wallet]);
  
  

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const options = {
          method: "GET",
          url: process.env.NEXT_PUBLIC_BIRD_EYE_PRICE_ENDPOINT,
          params: {
            address: process.env.NEXT_PUBLIC_SOLANA_ADDRESS,
          },
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_BIRD_EYE_API_KEY,
            accept: "application/json",
            "x-chain": "solana",
          },
        };

        const response = await axios.request(options);

        setSolPrice(Number(Number(response.data.data.value).toFixed(2)));
      } catch (error) {
        console.error("Error fetching Sol price:", error);
      }
    };

    fetchSolPrice();
  }, []);

  useEffect(() => {
    const preventScroll = (event: WheelEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement &&
        activeElement.type === "number"
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventScroll);
    };
  }, []);

  return (
    <div className="flex flex-col items-center bg-[#ede9f7] dark:bg-black py-8 px-4">
      {errorMessage && (
        <ErrorMessage
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
      <div className="w-full max-w-6xl bg-white dark:bg-[#202020] shadow-lg rounded-xl p-6 space-y-6 border border-purple-200 dark:border-[#3A3A3A]">
        <h2 className="text-2xl font-zilla-slab text-start text-gray-900 dark:text-[#F8EBD0]">
          Get{" "}
          <span className="text-[#6F5DA8] font-bold">
            {stake ? "sSOL" : "SOL"}
          </span>{" "}
          token
        </h2>

        {/* Toggle between Stake and Unstake */}
        <div className="flex items-center justify-center space-x-4 bg-[#CCBDFC] dark:bg-black p-2 rounded-lg w-full">
          <div className="relative w-1/2 flex">
            <button
              onClick={() => setStake(true)}
              className={`w-full py-2 text-md font-medium rounded-lg transition-all flex items-center justify-center space-x-2 ${
                stake
                  ? "bg-white text-black dark:bg-[#3A3A3A] dark:text-[#F8EBD0]"
                  : "bg-[#CCBDFC] dark:bg-black text-black dark:text-[#F8EBD0]"
              }`}
            >
              <span className="relative">Stake</span>
              <span className="bg-[#6F5DA8] text-white text-[8px] py-1 px-2 rounded-md font-poppins">
                ≈ 8.04% APY
              </span>
            </button>
          </div>

          <div className="w-1/2">
            <button
              onClick={() => setStake(false)}
              className={`w-full py-2 text-md font-medium rounded-lg transition-all ${
                !stake
                  ? "bg-white text-black dark:bg-[#3A3A3A] dark:text-[#F8EBD0]"
                  : "bg-[#CCBDFC] dark:bg-black text-black dark:text-[#F8EBD0]"
              }`}
            >
              <span className="relative left-0 md:left-0">Unstake</span>
            </button>
          </div>
        </div>

        {/* Stake or Unstake Content */}
        {stake ? (
          // Stake Section
          <>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-[#F8EBD0]">
              <span className="font-poppins text-[#181818] dark:text-[#F8EBD0]">
                You’re staking
              </span>
              <div className="flex items-center space-x-1">
                <FaWallet className="text-[#6F5DA8] dark:text-[#6F5DA8]" />
                <span className="text-xs text-[#181818] dark:text-[#F8EBD0] font-poppins">
                  {balance.toFixed(3)}
                </span>
              </div>
            </div>
            <div className="flex items-center bg-[#F0EEFF] dark:bg-black rounded-2xl p-2 border-[#CCBDFC] border-2">
              <div className="flex items-center space-x-2 bg-white dark:bg-[#3A3A3A] p-2 rounded-lg">
                <img src="/sol-icon.png" alt="SOL" className="h-8 w-8" />
                <span className="text-gray-800 font-bold dark:text-[#F8EBD0]">
                  SOL
                </span>
                <FaChevronDown className="text-[#6F5DA8] dark:text-[#6F5DA8]" />
              </div>
              <div className="ml-auto flex flex-col items-end font-zilla-slab">
                <input
                  type="number"
                  placeholder="0.0"
                  className="ml-auto text-2xl font-bold text-gray-900 dark:text-[#F8EBD0] bg-transparent focus:outline-none w-40 text-right"
                  value={stakeAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only non-negative values
                    setStakeAmount(value);
                  }}
                  onKeyDown={(e) => {
                    // Prevent typing the minus sign
                    if (e.key === "-") {
                      e.preventDefault();
                    }
                  }}
                  min="0"
                />
                <div className="text-sm text-[#6F5DA8] dark:text-[#6F5DA8] ml-2">
                  {(Number(stakeAmount) * solPrice).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-[#181818] dark:text-[#F8EBD0] font-poppins">
              <span className="flex">
                To receive
                <FiInfo className="text-[#6F5DA8] dark:text-[#6F5DA8] ml-1 mt-1" />
              </span>
              <div className="flex items-center space-x-1">
                {/* <FiInfo className="text-gray-400 dark:text-gray-500" /> */}
                <span className="text-xs text-[#181818] dark:text-[#F8EBD0] font-poppins">
                  0% Slippage
                </span>
              </div>
            </div>
            <div className="flex items-center bg-[#F0EEFF] dark:bg-black rounded-2xl p-2 border-[#CCBDFC] border-2">
              <div className="flex items-center space-x-2 bg-white dark:bg-[#3A3A3A] p-2 rounded-lg">
                <img src="/ssol-icon.png" alt="sSOL" className="h-8 w-8" />
                <span className="text-gray-800 font-bold dark:text-[#F8EBD0]">
                  sSOL
                </span>
              </div>
              <div className="ml-auto flex flex-col items-end">
                {/* <input
                  type="number"
                  placeholder="10.89"
                  className="ml-auto text-2xl font-bold text-gray-900 dark:text-[#F8EBD0] bg-transparent focus:outline-none w-14"
                /> */}
                {/* <div className="text-sm text-[#6F5DA8] dark:text-[#6F5DA8] ml-2">
                  $2101.82
                </div> */}
              </div>
            </div>

            <button
              disabled={!publicKey}
              className={`w-full py-3 rounded-full font-bold text-lg ${
                publicKey
                  ? "bg-[#6F5DA8] dark:bg-[#6F5DA8] text-[#F8EBD0] cursor-pointer"
                  : "bg-gray-400 dark:bg-gray-600 text-gray-300 cursor-not-allowed"
              }`}
              onClick={handleConvertToSSOL}
            >
              Convert to sSOL
            </button>
          </>
        ) : (
          // Unstake Section
          <>
            <div>
              {/* Unstaking Header */}
              <div className="text-sm text-[#181818] dark:text-[#F8EBD0] mb-6 font-poppins">
                <span>You’re unstaking</span>
                <div className="flex items-center space-x-1 float-right">
                  <FaWallet className="text-[#6F5DA8] dark:text-[#6F5DA8]" />
                  <span className="text-xs text-[#181818] dark:text-[#F8EBD0] font-poppins">
                    {Number(sSolBalance).toFixed(3)}
                  </span>
                </div>
              </div>

              {/* sSOL Information Box */}
              <div className="flex items-center bg-[#F0EEFF] dark:bg-black rounded-2xl p-2 border-[#CCBDFC] border-2 mt-2">
                <div className="flex items-center space-x-2 bg-white dark:bg-[#3A3A3A] rounded-lg p-2">
                  <img src="/ssol-icon.png" alt="sSOL" className="h-8 w-8" />
                  <span className="text-gray-800 font-bold dark:text-[#F8EBD0]">
                    sSOL
                  </span>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  {/* <div className="text-2xl font-bold text-gray-900 dark:text-[#F8EBD0]">12.5</div> */}
                  <input
                    type="number"
                    placeholder="0.0"
                    className="ml-auto text-2xl font-bold text-gray-900 dark:text-[#F8EBD0] bg-transparent focus:outline-none w-40 text-right"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent typing the minus sign
                      if (e.key === "-") {
                        e.preventDefault();
                      }
                    }}
                    min="0"
                  />
                  <div className="text-sm text-[#6F5DA8] dark:text-[#6F5DA8]">
                    {/* {(Number(stakeAmount) * solPrice).toFixed(2)} */}0.00
                  </div>
                </div>
              </div>

              <div className="border-2 border-[#CCBDFC] rounded-lg mt-4 p-2">
                {/* Jupiter and Delayed Options */}
                <div className="flex justify-between items-center p-2 bg-white dark:bg-[#202020] rounded-lg border border-[#CCBDFC] dark:text-[#F8EBD0] flex-wrap space-y-2 md:space-y-0">
                  {/* Immediately via Jupiter Section */}
                  <div
                    className={`flex-1 min-w-[45%] rounded-md p-2 cursor-pointer ${
                      selectedOption === "immediate"
                        ? "bg-[#6F5DA8] dark:bg-[#6F5DA8] border-2 border-[#6F5DA8]"
                        : "bg-white dark:bg-transparent"
                    }`}
                    onClick={() => setSelectedOption("immediate")}
                  >
                    <span className="text-base md:text-lg font-semibold">
                      <span
                        className={`${
                          selectedOption === "immediate"
                            ? "text-[#FFFFFF]"
                            : "text-inherit"
                        }`}
                      >
                        Immediately
                      </span>{" "}
                      <span
                        className={`${
                          selectedOption === "immediate"
                            ? "text-[#F8EBD0]"
                            : "text-[#6F5DA8]"
                        }`}
                      >
                        via Jupiter
                      </span>
                    </span>
                    <div
                      className={`flex items-center justify-between mt-1.5 border py-1 rounded-full px-1 font-sans ${
                        selectedOption === "immediate"
                          ? "bg-[#EDE8FD] dark:bg-[#202020] dark:text-[#CCBDFC] border-[#CCBDFC] text-[#6F5DA8]"
                          : "bg-white dark:bg-[#3A3A3A] border-[#6F5DA8]"
                      }`}
                      style={{
                        gap: "1px", // Minimize the gap between buttons
                        overflow: "hidden", // Prevent overflow
                      }}
                    >
                      {options.map((option, index) => (
                        <button
                          key={index}
                          className={`py-0.5 px-1 text-[8px] font-medium rounded-full whitespace-nowrap ${
                            selected === option
                              ? "bg-[#6F5DA8] text-white"
                              : "bg-transparent"
                          }`}
                          style={{
                            flex: 1, // Ensures buttons share equal space
                            maxWidth: "60px", // Further restricts button size
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent parent div click
                            setSelected(option);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delayed Section */}
                  <div
                    className={`relative flex-1 min-w-[45%] rounded-md p-2 cursor-pointer ${
                      selectedOption === "delayed"
                        ? "bg-[#6F5DA8] dark:bg-[#6F5DA8] border-2 border-[#6F5DA8]"
                        : "bg-white dark:bg-transparent"
                    }`}
                    onClick={() => setSelectedOption("delayed")}
                  >
                    {/* FiInfo Icon in Top-Right Corner */}
                    <FiInfo
                      className={`absolute top-2 right-2 ${
                        selectedOption === "delayed"
                          ? "text-[#F8EBD0]"
                          : "text-[#6F5DA8]"
                      } dark:${
                        selectedOption === "delayed"
                          ? "text-[#F8EBD0]"
                          : "text-[#6F5DA8]"
                      }`}
                      onClick={handleChangeOverlay} // Toggle the overlay on click
                    />

                    {/* Conditionally Render DelayedUnstakeOverlay */}
                    {isOverlayVisible && (
                      <div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        onClick={handleChangeOverlay} // Close when clicking outside
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <DelayedUnstakeOverlay
                            onClose={() => setIsOverlayVisible(false)}
                          />
                        </div>
                      </div>
                    )}

                    <span className="text-base md:text-lg font-semibold">
                      <span
                        className={`${
                          selectedOption === "delayed"
                            ? "text-[#FFFFFF]"
                            : "text-inherit"
                        }`}
                      >
                        Delayed
                      </span>{" "}
                      <span
                        className={`${
                          selectedOption === "delayed"
                            ? "text-[#F8EBD0]"
                            : "text-[#6F5DA8]"
                        }`}
                      >
                        in 2 <br /> days
                      </span>
                    </span>

                    <div
                      className={`text-xs md:text-xs mt-1 font-poppins rounded-md ${
                        selectedOption === "delayed"
                          ? "bg-[#6F5DA8] dark:bg-[#6F5DA8] text-white"
                          : "bg-white dark:bg-transparent"
                      }`}
                    >
                      0.1% Unstake Fee
                    </div>
                  </div>
                </div>

                {/* SOL Amount Display */}
                <div className="flex items-center space-x-2 justify-between mt-2 bg-[#EDE8FD] rounded-lg p-2 border-[#CCBDFC] dark:bg-black border-2 text-2xl font-bold text-gray-900 dark:text-[#F8EBD0]">
                  <div className="flex items-center space-x-2 bg-white dark:bg-[#3A3A3A] rounded-lg p-2 text-base">
                    <img src="/sol-icon.png" alt="SOL" className="h-8 w-8" />
                    <span className="text-gray-800 font-bold dark:text-gray-200">
                      SOL
                    </span>
                  </div>
                  {/* <span className="text-[#6F5DA8]">13.0775647</span> */}
                </div>
              </div>

              {/* Unstake Button */}
              <div className="mt-4 flex justify-center">
                <button
                  className={`w-full py-3 rounded-full font-bold text-lg ${
                    publicKey
                      ? "bg-[#6F5DA8] text-[#F8EBD0] cursor-pointer"
                      : "bg-gray-400 text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={handleUnstake}
                  disabled={!publicKey}
                >
                  Unstake SOL
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-full max-w-6xl bg-white dark:bg-[#181818] shadow-lg rounded-xl p-6 space-y-6 border border-purple-200 dark:border-[#3A3A3A] mt-2">
        {/* Conversion Rate */}
        <div className="flex justify-between text-sm text-gray-800 dark:text-[#F8EBD0] font-poppins mt-4">
          <span>1 sSol Token</span>
          <span>≈1.012 SOL</span>
        </div>

        {/* Priority Fee Option */}
        <div className="flex items-center justify-between mt-4 font-poppins">
          <span className="text-sm text-gray-800 dark:text-[#F8EBD0] flex items-center relative">
            Priority fee active
            <FiInfo
              className="ml-1 text-[#6F5DA8] dark:text-[#6F5DA8]"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute top-full left-0 mt-2 w-56 p-2 bg-purple-100 text-[#6F5DA8] border-2 border-[#CCBDFC] text-xs rounded-lg shadow-lg dark:bg-[#181818] dark:border-[#3A3A3A] dark:text-[#F8EBD0]">
                Pay a small fee to prioritize the inclusion of your transaction
                in the next blocks.
              </div>
            )}
          </span>
          <div className="flex space-x-2 border-[#CCBDFC] border-2 rounded-full">
            <button
              onClick={() => setPriorityFee(false)}
              className={`px-3 py-1 text-xs rounded-full transition ${
                !priorityFee ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              Off
            </button>
            <button
              onClick={() => setPriorityFee(true)}
              className={`px-3 py-1 text-xs rounded-full transition font-semibold ${
                priorityFee ? "bg-[#F0EEFF] text-[#5040AA]" : ""
              }`}
            >
              On
            </button>
          </div>
        </div>

        {/* Tips Active Option */}
        {/* <div className="flex items-center justify-between mt-4 font-poppins">
          <span className="text-sm text-gray-800 dark:text-[#F8EBD0] flex items-center">
            Tips active{" "}
            <FiInfo className="ml-1 text-[#6F5DA8] dark:text-[#6F5DA8]" />
          </span>
          <div className="flex space-x-2 border-[#CCBDFC] border-2 rounded-full dark:text-[#F8EBD0]">
            <button
              onClick={() => setTipsActive("off")}
              className={`px-3 py-1 text-xs rounded-full transition ${
                tipsActive === "off" ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              Off
            </button>
            <button
              onClick={() => setTipsActive("low")}
              className={`px-3 py-1 text-xs rounded-full transition ${
                tipsActive === "low" ? "bg-[#F0EEFF] text-[#5040AA]" : ""
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setTipsActive("on")}
              className={`px-3 py-1 text-xs rounded-full transition font-semibold ${
                tipsActive === "on" ? "bg-[#F0EEFF] text-[#5040AA]" : ""
              }`}
            >
              On
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}