import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  Keypair,
} from "@solana/web3.js";
import { SolisticStaking, IDL } from "../../targets/types/solistic_staking";
import idl from "../../targets/idl/solistic_staking.json";

interface AnchorCompatibleWallet {
  publicKey: PublicKey | null;
  signTransaction: <T extends Transaction | VersionedTransaction>(
    tx: T
  ) => Promise<T>;
  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    txs: T[]
  ) => Promise<T[]>;
}

export const initConfig = (wallet: any, userPublicKey: PublicKey) => {
  const RPC = process.env.NEXT_PUBLIC_RPC || "";

  if (!RPC) {
    throw new Error("Missing required environment variables: PAYER_KEY or RPC");
  }

  // Initialize Solana connection and payer
  const connection = new Connection(RPC, { commitment: "finalized" });
  const contractAddr = new PublicKey(idl.metadata.address);

  const anchorWallet: AnchorCompatibleWallet = {
    publicKey: userPublicKey,
    signTransaction: wallet.adapter.signTransaction,
    signAllTransactions: wallet.adapter.signAllTransactions,
  };

  // Next.js-friendly provider
  const provider: AnchorProvider | null = new AnchorProvider(
    connection,
    anchorWallet,
    {
      commitment: "finalized",
    }
  );

  // Initialize Anchor program
  const program = provider
    ? new Program<SolisticStaking>(IDL, contractAddr, provider)
    : null;

  return { connection, contractAddr, provider, program };
};
