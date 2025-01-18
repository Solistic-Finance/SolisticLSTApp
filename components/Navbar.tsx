import ConnectWalletButton from "./ConnectWalletButton";
import ThemeToggleButton from "./ThemeToggle";

const Navbar = () => {
  const style = {
    backgroundColor: "#6F5DA8",
    color: "#f5edd3",
    fontFamily: "Zilla Slab, serif",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "70px",
    padding: "10px 20px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  };

  return (
    <div className="px-4 sm:px-6">
      <div className="relative flex items-center justify-between px-4 py-2 border-2 rounded-full bg-white dark:bg-[#181818] border-[#CCBDFC] dark:border-[#3A3A3A] w-full max-w-4xl mx-auto mt-6 sm:mt-8 md:mt-10 lg:mt-4">
        {/* Left side logo */}
        <div className="flex-1 flex items-center">
          {/* Light Mode Logo for Mobile */}
          <img
            src="/logo-light-mobile.png"
            alt="Logo Light Mobile"
            className="block sm:hidden dark:hidden h-8"
          />
          {/* Dark Mode Logo for Mobile */}
          <img
            src="/logo-dark-mobile.png"
            alt="Logo Dark Mobile"
            className="hidden dark:block sm:dark:hidden h-8"
          />
          {/* Light Mode Logo for Desktop */}
          <img
            src="/logo-light.png"
            alt="Logo Light Desktop"
            className="hidden sm:block dark:hidden h-8"
          />
          {/* Dark Mode Logo for Desktop */}
          <img
            src="/logo-dark.png"
            alt="Logo Dark Desktop"
            className="hidden sm:dark:block sm:hidden h-8"
          />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center">
          <ThemeToggleButton />
          <ConnectWalletButton style={style} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
