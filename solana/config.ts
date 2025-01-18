// import { AnchorProvider, Program } from "@coral-xyz/anchor";
// import { Connection, PublicKey, Keypair } from "@solana/web3.js";
// import {
//   SolisticStaking,
//   IDL,
// } from "../targets/types/solistic_staking";
// import idl from "../targets/idl/solistic_staking.json";

// const RPC = process.env.NEXT_PUBLIC_RPC || "";

// const payer = Keypair.generate();

// // Check for required environment variables
// if (!payer || !RPC) {
//   throw new Error("Missing required environment variables: PAYER_KEY or RPC");
// }

// // Initialize Solana connection and payer
// const connection = new Connection(RPC, { commitment: "finalized" });
// const contractAddr = new PublicKey(idl.metadata.address);

// // Next.js-friendly provider
// let provider: AnchorProvider | null = null;

// // Ensure wallet and provider are accessible in both server and client
// if (typeof window !== "undefined") {
//   const wallet = new AnchorProvider(connection, payer as any, {});
//   provider = new AnchorProvider(connection, wallet as any, {});
// }

// // Initialize Anchor program
// const program = provider
//   ? new Program<SolisticStaking>(IDL, contractAddr, provider)
//   : null;

// export { payer, connection, contractAddr, provider, program };
