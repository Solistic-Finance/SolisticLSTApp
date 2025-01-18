"use client";
import React, { useEffect, useState } from "react";

import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

const ConnectWalletButton = ({ style }: { style: any }) => {
  const [domLoaded, setDomLoaded] = useState(false);
  const { connected } = useWallet();

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    <>
      {domLoaded && (
        <div>
          <WalletModalProvider>
            <div style={{ display: "flex", alignItems: "center" }}>
              <WalletMultiButton style={style} className="font-zilla-slab">
                {!connected && " Connect Wallet"}
              </WalletMultiButton>
            </div>
          </WalletModalProvider>
        </div>
      )}
    </>
  );
};

export default ConnectWalletButton;
