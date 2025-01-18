import { config } from "dotenv";
// import { program } from "./config";
import { PublicKey } from "@solana/web3.js";
config();

async function getStateAccountData(program) {
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
