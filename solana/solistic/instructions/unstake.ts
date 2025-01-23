import { BN } from "bn.js";
// import { connection, contractAddr, program } from "./config";
import { getStateAccountData } from "../getters/getStateAccountData";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Wallet } from "@solana/wallet-adapter-react";
import { initConfig } from "../initConfig";

export async function unstake(
  sSolAmount: string,
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
    const { connection, contractAddr, program } = initConfig(
      wallet,
      userPublicKey
    );
    const sSolAmt = new BN(sSolAmount);

    const stateAccountPubKey = new PublicKey(stateAccountAddr);
    const stateAccountData = await getStateAccountData(program);

    const ssolMint = stateAccountData.ssolMint;

    // Generate PDAs for the liquidity pool and authority
    const [solLegPda] = PublicKey.findProgramAddressSync(
      [stateAccountPubKey.toBuffer(), Buffer.from("liq_sol")],
      contractAddr
    );

    const [authoritySSolLegAcc] = PublicKey.findProgramAddressSync(
      [stateAccountPubKey.toBuffer(), Buffer.from("liq_st_sol_authority")],
      contractAddr
    );

    // Get the associated token account (ATA) for the user and the mint
    const getsSolFrom = getAssociatedTokenAddressSync(ssolMint, userPublicKey);
    const sSolLeg = getAssociatedTokenAddressSync(
      ssolMint,
      authoritySSolLegAcc,
      true
    );

    const transaction = new Transaction();

    const setComputeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: priorityFee ? 800_000 : 400_000,
    });

    const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee ? 20 : 2, // example priority fee: 2 
    });

    transaction.add(setComputeUnitLimitIx, setComputeUnitPriceIx);

    const unStakeTx = await program.methods
      .liquidUnstake(sSolAmt)
      .accounts({
        state: stateAccountAddr,
        ssolMint: ssolMint,
        liqPoolSsolLeg: sSolLeg,
        liqPoolSolLegPda: solLegPda,
        treasurySsolAccount: stateAccountData.treasurySsolAccount,
        getSsolFrom: getsSolFrom,
        getSsolFromAuthority: userPublicKey,
        transferSolTo: userPublicKey,
      })
      .transaction();

    unStakeTx.feePayer = userPublicKey;
    unStakeTx.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const sig = await sendTransaction(unStakeTx, connection);

    return sig;
  } catch (error) {
    console.error("Error during unstake:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}
