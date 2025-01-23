import { config } from "dotenv";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { SolisticStaking } from "../../../targets/types/solistic_staking";
config();

async function getStateAccountData(program: Program<SolisticStaking>) {
  try {
    const stateAccountAddr = new PublicKey(
      process.env.NEXT_PUBLIC_STATE_ACCOUNT || ""
    );

    const state = await program.account.state.fetch(stateAccountAddr);

    return state;
  } catch (error) {
    throw error;
  }
}

export { getStateAccountData };
