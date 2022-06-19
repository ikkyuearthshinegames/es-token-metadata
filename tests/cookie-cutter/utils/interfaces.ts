import {
  PublicKeyInitData,
  Keypair,
  TransactionInstruction,
  Blockhash,
  FeeCalculator,
  PublicKey,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

export type CreateCookieCutterArgs = {
  keypair: Keypair;
  env: string;
  sellerFeeBasisPoints: number;
  canChangeSalePrice: boolean;
  requiresSignOff: boolean;
  treasuryWithdrawalDestination: PublicKey;
  feeWithdrawalDestination: PublicKey;
  treasuryMint: PublicKey;
};

export type CreateCookieCutterRPCArgs = {
  cookieCutterBump: number;
  cookieCutterTreasuryBump: number;
  cookieCutterFeePayerBump: number;
  sellerFeeBasisPoints: number;
  requiresSignOff: boolean;
  canChangeSalePrice: boolean;
};

export type CreateCookieCutterAccountArgs = {
  treasuryMint: PublicKey;
  payer: PublicKey;
  authority: PublicKey;
  feeWithdrawalDestination: PublicKey;
  treasuryWithdrawalDestination: PublicKey;
  treasuryWithdrawalDestinationOwner: PublicKey;
  cookieCutter: PublicKey;
  cookieCutterFeeAccount: PublicKey;
  cookieCutterTreasury: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  ataProgram: PublicKey;
  rent: any;
};

export type CookieCutterObject = {
  cookieCutterFeeAccount: PublicKey;
  cookieCutterTreasury: PublicKey;
  treasuryWithdrawalDestination: PublicKey;
  feeWithdrawalDestination: PublicKey;
  treasuryMint: PublicKey;
  authority: PublicKey;
  creator: PublicKey;
  bump: number;
  treasuryBump: number;
  feePayerBump: number;
  sellerFeeBasisPoints: number;
  requiresSignOff: boolean;
  canChangeSalePrice: boolean;
  escrowPaymentBump: number;
};

export type SellCookieCutterArgs = {
  walletKeypair: Keypair;
  env: string;
  cookieCutterKey: anchor.web3.PublicKey;
  buyPrice: number;
  mintKey: anchor.web3.PublicKey;
  tokenSize: number;
  cookieCutterSigns: boolean;
};

export type CookieCutterTradeStateSeeds = {
  cookieCutterKey: anchor.web3.PublicKey;
  walletKey: anchor.web3.PublicKey;
  tokenAccount: anchor.web3.PublicKey;
  treasuryMint: anchor.web3.PublicKey;
  tokenMint: anchor.web3.PublicKey;
  tokenSize: anchor.BN;
  buyPrice: anchor.BN;
};

export type SellCookieCutterRPCArgs = {
  metadataBump: number;
  programAsSignerBump: number;
  buyerPrice: anchor.BN;
  tokenSize: anchor.BN;
};

export type SellCookieCutterAccountArgs = {
  wallet: PublicKey;
  tokenAccount: PublicKey;
  metadataAccount: PublicKey;
  authority: PublicKey;
  cookieCutter: PublicKey;
  cookieCutterFeeAccount: PublicKey;
  sellerTradeState: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
  rent: any;
  programAsSigner: PublicKey;
};
