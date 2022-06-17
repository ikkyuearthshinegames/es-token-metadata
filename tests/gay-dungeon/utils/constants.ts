import { AnchorProvider, web3 } from "@project-serum/anchor";
import { PublicKey, clusterApiUrl, Keypair } from "@solana/web3.js";

export const GAY_DUNGEON = "gay_dungeon";
export const FEE_PAYER = "fee_payer";
export const TREASURY = "treasury";
export const SIGNER = "signer";
export const METADATA = "metadata";

export const GAY_DUNGEON_PROGRAM_ID = new PublicKey(
  "Bz4repUbACRtNKsrTZUhgfNzXKbsu6JcLzawHFqoSz3X"
);

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const TREASURY_WALLET_KEY = new PublicKey(
  "FMCFRg2wct97arsFKfqpgcKafszWAWhpPcg3LqCCdnr7"
);

export const FEE_DESTINATION_WALLET_KEY = new PublicKey(
  "62Y9187d4PufGT948wrLrNeqDgZcdfEUEZj9kwfmn9Lw"
);
