import "./globals.css";
import ThemeProviderWrapper from "../components/ThemeProviderWrapper";
import WalletConnectionProvider from "../components/WalletConnectionProvider";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Zilla_Slab, Poppins } from "next/font/google";

// Configure fonts
const zillaSlab = Zilla_Slab({
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Solistic Finance",
  description: "Solistic Finance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${zillaSlab.className} ${poppins.className}`}>
      <body className="antialiased">
        <WalletConnectionProvider>
          <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
        </WalletConnectionProvider>
      </body>
    </html>
  );
}
