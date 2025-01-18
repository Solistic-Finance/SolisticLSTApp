import { Transaction, Connection, Keypair, PublicKey } from "@solana/web3.js";

interface TSolflare {
  signTransaction(transaction: Transaction): unknown;
  connect: () => Promise<any>;
  publicKey: string;
  disconnect: () => void;
}

interface TSol {
  Connection: any;
  signAndSendTransaction(
    transaction: Transaction
  ): { signature: any } | PromiseLike<{ signature: any }>;
  connect: () => Promise<any>;
  isPhantom: boolean;
  signTransaction(transaction: Transaction): Promise<Transaction>;

}

interface TPhantom {
  solana: TSol;
}
interface TOkx {
  solana: TSol;
}

declare global {
  interface Window {
    solflare: TSolflare;
    phantom: TPhantom;
    okxwallet: TOkx;
    solana: TSolana;
  }
}

interface TSolana {
  isConnected: boolean;
  signTransaction(transaction: Transaction): Promise<Transaction>;

}

interface InitParam {
  stateAccount: Keypair;
  stakeList: Keypair;
  validatorList: Keypair;
  operationalSolAccount: Keypair;
  stakeAccount: Keypair;
  authoritySsolAcc: PublicKey;
  authorityLpAcc: PublicKey;
  reservePda: PublicKey;
  solLegPda: PublicKey;
  authoritySSolLegAcc: PublicKey;
  stakeDepositAuthority: PublicKey;
  stakeWithdrawAuthority: PublicKey;
  ssolMint: PublicKey;
  lpMint: PublicKey;
  treasurySsolAccount: PublicKey;
  sSolLeg: PublicKey;
  mint_to: PublicKey;
  mint_to_lp: PublicKey;
  burnSsolFrom: PublicKey;
}

export { InitParam };
