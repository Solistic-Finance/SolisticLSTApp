import { config } from "dotenv";
import { PublicKey } from "@solana/web3.js";
import { SolisticStaking } from "../targets/types/solistic_staking";
import { Program } from "@coral-xyz/anchor";
config();

async function getDelayedUnstakeTickets(program: Program<SolisticStaking>, user: PublicKey) {
  try {
    const ticketAccountData = await program.account.ticketAccountData.all();
    const tickets = ticketAccountData.filter((ticket) => ticket.account.beneficiary === user);
    return tickets.map((ticket) => ({
      lamportsAmount: ticket.account.lamportsAmount,
      createdEpoch: ticket.account.createdEpoch,
    }));
  } catch (error) {
    throw error;
  }
}

export { getDelayedUnstakeTickets };
