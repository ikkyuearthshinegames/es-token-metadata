import { CreateGayDungeonArgs, GayDungeonObject } from "./interfaces";
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
import { WRAPPED_SOL_MINT } from "./constants";

export const showGayDungeon = async ({
  walletKeyPair,
  env,
  gayDungeonKey,
  treasuryMint,
}: {
  walletKeyPair: Keypair;
  env: string;
  gayDungeonKey: PublicKey;
  treasuryMint: PublicKey;
}): Promise<void> => {
  console.log("----------- --------------------- ------------");
  console.log("----------- SHOWING GAY DUNGEON   ------------");
  console.log("----------- --------------------- ------------");

  const gayDungeonProgram = await loadGayDungeonProgram(walletKeyPair, env);

  const treasuryMintKey = treasuryMint ? treasuryMint : WRAPPED_SOL_MINT;

  const gayDungeonObj: GayDungeonObject =
    (await gayDungeonProgram.account.gayDungeon.fetchNullable(
      gayDungeonKey
    )) as GayDungeonObject;

  const treasuryAmount = await gayDungeonProgram.provider.connection.getBalance(
    gayDungeonObj.gayDungeonTreasury
  );

  const feeAmount = await gayDungeonProgram.provider.connection.getBalance(
    gayDungeonObj.gayDungeonFeeAccount
  );

  console.log("-----");
  console.log("Auction House:", gayDungeonKey.toBase58());
  console.log("Mint:", gayDungeonObj.treasuryMint.toBase58());
  console.log("Authority:", gayDungeonObj.authority.toBase58());
  console.log("Creator:", gayDungeonObj.creator.toBase58());
  console.log("Fee Payer Acct:", gayDungeonObj.gayDungeonFeeAccount.toBase58());
  console.log("Treasury Acct:", gayDungeonObj.gayDungeonTreasury.toBase58());
  console.log(
    "Fee Payer Withdrawal Acct:",
    gayDungeonObj.feeWithdrawalDestination.toBase58()
  );
  console.log(
    "Treasury Withdrawal Acct:",
    gayDungeonObj.treasuryWithdrawalDestination.toBase58()
  );

  console.log("Fee Payer Bal:", feeAmount);
  console.log("Treasury Bal:", treasuryAmount);
  console.log("Seller Fee Basis Points:", gayDungeonObj.sellerFeeBasisPoints);
  console.log("Requires Sign Off:", gayDungeonObj.requiresSignOff);
  console.log("Can Change Sale Price:", gayDungeonObj.canChangeSalePrice);
  console.log("AH Bump:", gayDungeonObj.bump);
  console.log("AH Fee Bump:", gayDungeonObj.feePayerBump);
  console.log("AH Treasury Bump:", gayDungeonObj.treasuryBump);
};
