import { BN } from "bn.js";
import { getStateAccountData } from "./getStateAccountData";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Wallet } from "@solana/wallet-adapter-react";
import { initConfig } from "./initConfig";

export async function delayedUnstake(
  amount: string,
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

    const { connection, program, provider } = initConfig(wallet, userPublicKey);

    const unstakeAmount = new BN(amount);
    const stateAccountPubKey = new PublicKey(stateAccountAddr);
    const stateAccountData = await getStateAccountData(program);

    const ssolMint = stateAccountData.ssolMint;

    // Generate new ticket account
    const newTicketAccount = Keypair.generate();

    // Get the associated token account (ATA) for the user and the mint
    const burnSsolFrom = getAssociatedTokenAddressSync(ssolMint, userPublicKey);

    const transaction = new Transaction();

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: userPublicKey,
        newAccountPubkey: newTicketAccount.publicKey,
        lamports: 1503360,
        space: 88,
        programId: program.programId,
      })
    );

    // set priority fees
    // const setComputeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    //   units: priorityFee ? 100_000 : 100_000,
    // });
    // const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    //   microLamports: priorityFee ? 30 : 30, // example priority fee: 2 micro-lamports per CU
    // });

    // transaction.add(setComputeUnitLimitIx, setComputeUnitPriceIx);

    // Create the delayed unstake transaction
    const delayedUnStakeTx = await program.methods
      .orderUnstake(unstakeAmount)
      .accounts({
        state: stateAccountPubKey,
        ssolMint: ssolMint,
        burnSsolFrom: burnSsolFrom,
        burnSsolAuthority: userPublicKey,
        newTicketAccount: newTicketAccount.publicKey,
      })
      .preInstructions([
        await program.account.ticketAccountData.createInstruction(
          newTicketAccount
        ),
      ])
      .transaction();

    delayedUnStakeTx.feePayer = userPublicKey;
    delayedUnStakeTx.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    delayedUnStakeTx.partialSign(newTicketAccount);

    const signature = await sendTransaction(delayedUnStakeTx, connection, {
      skipPreflight: true,
    });
    console.log("Transaction signature:", signature);
    return signature;
  } catch (error) {
    alert("Something went wrong");
  }
}
