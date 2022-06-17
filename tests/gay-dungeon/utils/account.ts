import * as anchor from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  AccountInfo,
  clusterApiUrl,
  Connection,
  SignatureStatus,
  Cluster,
} from "@solana/web3.js";
import {
  FEE_DESTINATION_WALLET_KEY,
  FEE_PAYER,
  GAY_DUNGEON,
  GAY_DUNGEON_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TREASURY,
  TREASURY_WALLET_KEY,
} from "./constants";
import { createGayDungeon } from "./create-gay-dungeon";
import { CreateGayDungeonArgs } from "./interfaces";
import { base58_to_binary } from "base58-js";

export const loadGayDungeonProgram = async (
  walletKeyPair: Keypair,
  env: string,
  customRpcUrl?: string
): Promise<anchor.Program> => {
  if (customRpcUrl) console.log("USING CUSTOM URL", customRpcUrl);

  const walletWrapper = new anchor.Wallet(walletKeyPair);

  console.log("deployment env => ", env);

  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl(env as Cluster),
    "confirmed"
  );
  const provider = new anchor.AnchorProvider(connection, walletWrapper, {
    preflightCommitment: "confirmed",
  });

  console.log("fetching IDL using program ID => ", GAY_DUNGEON_PROGRAM_ID);
  const idl = await anchor.Program.fetchIdl(GAY_DUNGEON_PROGRAM_ID, provider);

  return new anchor.Program(idl, GAY_DUNGEON_PROGRAM_ID, provider);
};

export const addSOLToWallet = async (wallet: Keypair) => {
  try {
    const network = clusterApiUrl("devnet");

    const connection = new Connection(network);
    const airdropSignature = await connection.requestAirdrop(
      wallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL // 10000000 Lamports in 1 SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });
  } catch (error) {
    console.error(error);
  }
};

export const initGayDungeon = async (): Promise<{
  walletKeyPair: anchor.web3.Keypair;
  gayDungeon: PublicKey;
}> => {
  const walletKeyPair = anchor.web3.Keypair.generate();

  await addSOLToWallet(walletKeyPair);

  const gayDungeon = await createGayDungeon({
    keypair: walletKeyPair,
    env: "devnet",
    sellerFeeBasisPoints: 100,
    canChangeSalePrice: false,
    requiresSignOff: false,
    treasuryWithdrawalDestination: TREASURY_WALLET_KEY,
    feeWithdrawalDestination: FEE_DESTINATION_WALLET_KEY,
    treasuryMint: null,
  });

  console.log(
    "[ account ] [ initGayDungeon ] gayDungeon.toBase58 => ",
    gayDungeon.toBase58()
  );

  return { walletKeyPair, gayDungeon };
};

export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  const ata = await anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  return ata;
};

export const getGayDungeon = async (
  creator: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey
): Promise<[PublicKey, number]> => {
  try {
    const gd = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(GAY_DUNGEON), creator.toBuffer(), treasuryMint.toBuffer()],
      GAY_DUNGEON_PROGRAM_ID
    );

    return gd;
  } catch (error) {
    console.log("[account] [getGayDungeon] error in getGayDungeon => ", error);
  }
};

export const getGayDungeonFeeAccount = async (
  gayDungeon: anchor.web3.PublicKey
): Promise<[PublicKey, number]> => {
  const gdFeeAcct = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GAY_DUNGEON), gayDungeon.toBuffer(), Buffer.from(FEE_PAYER)],
    GAY_DUNGEON_PROGRAM_ID
  );

  return gdFeeAcct;
};

export const getGayDungeonTreasuryAccount = async (
  gayDungeon: anchor.web3.PublicKey
): Promise<[PublicKey, number]> => {
  const gdTAcct = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GAY_DUNGEON), gayDungeon.toBuffer(), Buffer.from(TREASURY)],
    GAY_DUNGEON_PROGRAM_ID
  );

  return gdTAcct;
};
