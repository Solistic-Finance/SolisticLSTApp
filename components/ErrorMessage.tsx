"use client";
import React from "react";
import { FiAlertCircle } from "react-icons/fi";

type TErrorMessage = {
  errorMessage: string;
  setErrorMessage: (value: string) => void;
};

const ErrorMessage = ({ errorMessage, setErrorMessage }: TErrorMessage) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-[#181818] shadow-lg rounded-lg p-10 md:w-1/4 w-96 text-center">
        <div className="flex items-center text-[#1F0B35] dark:text-[#F8EBD0]">
          <FiAlertCircle size={24} className="mr-2" />
          <h2 className="text-2xl font-bold text-[#1F0B35] text-start dark:text-[#F8EBD0]">
            Error!
          </h2>
        </div>
        <p className="mt-4 text-start text-sm text-[#181818] dark:text-[#F8EBD0]">
          {errorMessage}
        </p>
        {/* Dismiss button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setErrorMessage("")}
            className="px-4 py-2 rounded-full bg-[#65558F] text-white text-sm transition hover:bg-[#514174]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
