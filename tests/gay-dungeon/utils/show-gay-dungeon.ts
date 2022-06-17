import { CreateGayDungeonArgs } from "./interfaces";
import * as anchor from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  AccountInfo,
  clusterApiUrl,
  Connection,
  SignatureStatus,
} from "@solana/web3.js";
import { loadGayDungeonProgram } from "./account";

export const showGayDungeon = async ({
  keypair,
  env,
  gayDungeon,
  treasuryMint,
}: {
  keypair: Keypair;
  env: string;
  gayDungeon: PublicKey;
  treasuryMint: PublicKey;
}): Promise<void> => {
  console.log("----------- --------------------- ------------");
  console.log("----------- SHOWING GAY DUNGEON   ------------");
  console.log("----------- --------------------- ------------");
};
