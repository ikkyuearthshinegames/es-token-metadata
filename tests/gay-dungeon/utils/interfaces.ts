import {
  PublicKeyInitData,
  Keypair,
  TransactionInstruction,
  Blockhash,
  FeeCalculator,
  PublicKey,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

export type CreateGayDungeonArgs = {
  keypair: Keypair;
  env: string;
  sellerFeeBasisPoints: number;
  canChangeSalePrice: boolean;
  requiresSignOff: boolean;
  treasuryWithdrawalDestination: PublicKey;
  feeWithdrawalDestination: PublicKey;
  treasuryMint: PublicKey;
};

export type CreateGayDungeonRPCArgs = {
  gayDungeonBump: number;
  gayDungeonTreasuryBump: number;
  gayDungeonFeePayerBump: number;
  sellerFeeBasisPoints: number;
  requiresSignOff: boolean;
  canChangeSalePrice: boolean;
};

export type CreateGayDungeonAccountArgs = {
  treasuryMint: PublicKey;
  payer: PublicKey;
  authority: PublicKey;
  feeWithdrawalDestination: PublicKey;
  treasuryWithdrawalDestination: PublicKey;
  treasuryWithdrawalDestinationOwner: PublicKey;
  gayDungeon: PublicKey;
  gayDungeonFeeAccount: PublicKey;
  gayDungeonTreasury: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  ataProgram: PublicKey;
  rent: any;
};

export type GayDungeonObject = {
  gayDungeonFeeAccount: PublicKey;
  gayDungeonTreasury: PublicKey;
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

export type SellGayDungeonArgs = {
  walletKeypair: Keypair;
  env: string;
  gayDungeonKey: anchor.web3.PublicKey;
  buyPrice: number;
  mintKey: anchor.web3.PublicKey;
  tokenSize: number;
  gayDungeonSigns: boolean;
};

export type GayDungeonTradeStateSeeds = {
  gayDungeonKey: anchor.web3.PublicKey;
  walletKey: anchor.web3.PublicKey;
  tokenAccount: anchor.web3.PublicKey;
  treasuryMint: anchor.web3.PublicKey;
  tokenMint: anchor.web3.PublicKey;
  tokenSize: anchor.BN;
  buyPrice: anchor.BN;
};

export type SellGayDungeonRPCArgs = {
  metadataBump: number;
  programAsSignerBump: number;
  buyerPrice: anchor.BN;
  tokenSize: anchor.BN;
};

export type SellGayDungeonAccountArgs = {
  wallet: PublicKey;
  tokenAccount: PublicKey;
  metadataAccount: PublicKey;
  authority: PublicKey;
  gayDungeon: PublicKey;
  gayDungeonFeeAccount: PublicKey;
  sellerTradeState: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
  rent: any;
  programAsSigner: PublicKey;
};
