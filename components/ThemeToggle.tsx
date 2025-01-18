"use client";
import { useTheme } from "./ThemeContext";
import { FaRegMoon, FaSun } from "react-icons/fa";
import { FiSun } from "react-icons/fi";

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="top-0 right-0">
      <button
        onClick={toggleTheme}
        className={`flex items-center space-x-2 px-4 py-2 rounded transition duration-300 ease-in-out 
          ${theme === "light" ? " text-[#6F5DA8]" : "text-[#F8EBD0]"}
          transform hover:scale-105`}
      >
        {theme === "light" ? (
          <FaRegMoon className="h-5 w-5" />
        ) : (
          <FiSun className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default ThemeToggleButton;
