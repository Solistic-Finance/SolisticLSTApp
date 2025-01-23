
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { Wallet } from "@solana/wallet-adapter-react";
import { initConfig } from "../initConfig";

export async function claim(
  delayedUnstakeTicket: PublicKey,
  userPublicKey: PublicKey,
  wallet: Wallet,
  sendTransaction: any,
  connected: boolean,
  priorityFee: boolean
) {
  try {
    // Ensure a wallet is connected
    if (!connected || !wallet || !wallet.adapter) {
      throw new Error("No wallet is connected. Please connect your wallet.");
    }

    const stateAccountAddr = process.env.NEXT_PUBLIC_STATE_ACCOUNT || "";
    if (!stateAccountAddr) {
      throw new Error("State account missing in environment variables");
    }

    const { connection, program, provider, contractAddr } = initConfig(wallet, userPublicKey);

    const amountToBeClaimed = (await program.account.ticketAccountData.fetch(delayedUnstakeTicket)).lamportsAmount;
    const stateAccountPubKey = new PublicKey(stateAccountAddr);

    const transaction = new Transaction();
    // set priority fees
    const setComputeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: priorityFee ? 100_000 : 100_000,
    });
    const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee ? 30 : 30, // example priority fee: 2 micro-lamports per CU
    });
    
    transaction.add(setComputeUnitLimitIx, setComputeUnitPriceIx);

    const [reservePda] = PublicKey.findProgramAddressSync(
      [stateAccountPubKey.toBuffer(), Buffer.from("reserve")],
      contractAddr
    );

    // Create the claim transaction
    const claimTx = await program.methods
      .claim()
      .accounts({
        state: stateAccountPubKey,
        reservePda: reservePda,
        ticketAccount: delayedUnstakeTicket,
        transferSolTo: userPublicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    transaction.add(claimTx);
    transaction.feePayer = userPublicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const signature = await sendTransaction(transaction, connection, {
      skipPreflight: true,
    });
    console.log("Claim transaction signature:", signature);
    return signature;
  } catch (error) {
    console.error("Error during claim:");
    alert("Something went wrong");
  }
}
