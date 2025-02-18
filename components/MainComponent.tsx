"use client";
import { useState } from "react";
import StakeUnstakeComponent from "./StakeUnstake";
import TransactionSuccess from "./TransactionSuccess";

export default function MainComponent() {
  const [successSignature, setSuccessSignature] = useState("");
  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-[#ede9f7] dark:bg-black p-4 md:p-6 lg:p-8 space-y-6 md:space-y-0 md:space-x-14 lg:space-x-14">
        {successSignature && (
          // transaction success modal
          <TransactionSuccess
            successSignature={successSignature}
            setSuccessSignature={setSuccessSignature}
          ></TransactionSuccess>
        )}
        {/* Left Side */}
        <div className="md:w-96 w-full max-w-md text-center md:text-left self-start mt-8 order-2 md:order-1">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F0B35] dark:text-[#F8EBD0] text-start ml-4">
          AI Automated Stake Delegation Rewards
          </h2>
          <p className="text-base font-poppins md:text-lg lg:text-base text-[#5040AA] dark:text-[#CCBDFC] mt-4 lg:mt-6 text-start ml-4">
            Boost your yield by up to 15% when you stake{" "}
            {/* <br className="hidden lg:block" /> */}
            with Solistic
          </p>

          {/* Video Section */}
          <div className="flex justify-center mt-6 lg:mt-10">
            <div className="bg-[#CCBDFC] rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-none dark:bg-[#3A3A3A] overflow-hidden">
              <div className="relative pb-[56.25%]">
                <video
                  className="absolute inset-0 w-full h-full object-cover rounded-lg block dark:hidden"
                  autoPlay
                  loop
                  muted
                >
                  <source src="/info-light.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <video
                  className="absolute inset-0 w-full h-full object-cover rounded-lg hidden dark:block"
                  autoPlay
                  loop
                  muted
                >
                  <source src="/info-dark.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>

          <p className="text-lg md:text-2xl lg:text-2xl text-[#181818] dark:text-gray-300 mt-6 lg:mt-10 text-start ml-4">
            Why 1 SOL is not 1 sSOL
          </p>
          <p className="text-sm md:text-base lg:text-sm font-poppins text-[#3A3A3A] dark:text-gray-500 mt-2 text-start ml-4">
            When you stake SOL tokens in order to receive <br /> sSOL tokens,
            you receive a slightly lower amount <br /> of sSOL.{" "}
            <span 
              className="text-[#6F5DA8] dark:text-[#CCBDFC] font-poppins-600 cursor-pointer"
              onClick={() => window.open('https://docs.solistic.finance/staking-and-restaking/quickstart', '_blank')}
            >
              Learn more
            </span>
          </p>
        </div>

        {/* Right Side (StakeUnstakeComponent on top for mobile) */}
        <div className="md:w-1/2 w-full max-w-md self-start order-1 md:order-2">
          <StakeUnstakeComponent
            successSignature={successSignature}
            setSuccessSignature={setSuccessSignature}
          />
        </div>
      </div>
    </>
  );
}
