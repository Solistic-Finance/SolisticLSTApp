import { BN } from "bn.js";
// import { connection, contractAddr, program } from "./config";
import { getStateAccountData } from "../getters/getStateAccountData";
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import { createAtaTx } from "../../createAtaTx";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Wallet, useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { initConfig } from "../initConfig";

export async function deposit(
  amount: string,
  userPublicKey: PublicKey,
  wallet: Wallet,
  sendTransaction: any,
  connected: boolean,
  priorityFee: boolean
) {
  console.log("Deposit amount:", amount);

  try {
    // Ensure a wallet is connected
    if (!connected || !wallet || !wallet.adapter) {
      alert("No wallet is connected. Please connect your wallet.");
    }

    const stateAccountAddr = process.env.NEXT_PUBLIC_STATE_ACCOUNT || "";
    if (!stateAccountAddr) {
      alert("State account missing in environment variables");
    }

    const { connection, contractAddr, program } = initConfig(
      wallet,
      userPublicKey
    );

    const depositAmount = new BN(amount);
    const stateAccountPubKey = new PublicKey(stateAccountAddr);
    const stateAccountData = await getStateAccountData(program);

    const ssolMint = stateAccountData.ssolMint;

    // Generate PDAs for the liquidity pool and authority
    const [solLegPda] = PublicKey.findProgramAddressSync(
      [stateAccountPubKey.toBuffer(), Buffer.from("liq_sol")],
      contractAddr
    );
    const [authoritySsolAcc] = PublicKey.findProgramAddressSync(
      [stateAccountPubKey.toBuffer(), Buffer.from("st_mint")],
      contractAddr
    );
    const [authoritySSolLegAcc] = PublicKey.findProgramAddressSync(
      [stateAccountPubKey.toBuffer(), Buffer.from("liq_st_sol_authority")],
      contractAddr
    );
    const [reservePda] = PublicKey.findProgramAddressSync(
      [stateAccountPubKey.toBuffer(), Buffer.from("reserve")],
      contractAddr
    );

    // Get the associated token account (ATA) for the user and the mint
    const mintTo = getAssociatedTokenAddressSync(
      ssolMint,
      userPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const sSolLeg = getAssociatedTokenAddressSync(
      ssolMint,
      authoritySSolLegAcc,
      true
    );

    // Check if the user's ATA exists
    const accountExists = await connection.getAccountInfo(mintTo);
    console.log("Account exists : ", accountExists);
    const transaction = new Transaction();
    // set priority fees
    const setComputeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: priorityFee ? 100_000 : 100_000,
    });
    const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee ? 30 : 30, // example priority fee: 2 micro-lamports per CU
    });

    // transaction.add(setComputeUnitLimitIx, setComputeUnitPriceIx);
    if (!accountExists) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          mintTo,
          userPublicKey,
          ssolMint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    } else {
      // console.log(
      //   "Associated token account already exists:",
      //   mintTo.toBase58()
      // );
    }

    // Create the deposit transaction
    const staketx = await program.methods
      .deposit(depositAmount)
      .accounts({
        state: stateAccountPubKey,
        ssolMint: ssolMint,
        liqPoolSolLegPda: solLegPda,
        liqPoolSsolLeg: sSolLeg,
        liqPoolSsolLegAuthority: authoritySSolLegAcc,
        reservePda: reservePda,
        transferFrom: userPublicKey,
        mintTo: mintTo,
        ssolMintAuthority: authoritySsolAcc,
      })
      .transaction();
    transaction.add(staketx);
    transaction.feePayer = userPublicKey;

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const sig = await sendTransaction(transaction, connection, {
      skipPreflight: true,
    });

    return sig;
  } catch (error) {
    console.error("Error during deposit:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
}
