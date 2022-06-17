import {
  CreateGayDungeonAccountArgs,
  CreateGayDungeonArgs,
  CreateGayDungeonRPCArgs,
} from "./interfaces";
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
import {
  getAtaForMint,
  getGayDungeon,
  getGayDungeonFeeAccount,
  getGayDungeonTreasuryAccount,
  loadGayDungeonProgram,
} from "./account";
import {
  FEE_DESTINATION_WALLET_KEY,
  TOKEN_PROGRAM_ID,
  TREASURY_WALLET_KEY,
  WRAPPED_SOL_MINT,
} from "./constants";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createApproveInstruction,
  createRevokeInstruction,
} from "@solana/spl-token";

export const createGayDungeon = async (
  args: CreateGayDungeonArgs
): Promise<PublicKey> => {
  const {
    canChangeSalePrice,
    env,
    feeWithdrawalDestination,
    keypair,
    requiresSignOff,
    sellerFeeBasisPoints,
    treasuryMint,
    treasuryWithdrawalDestination,
  }: CreateGayDungeonArgs = args;

  const gayProgram: anchor.Program = await loadGayDungeonProgram(keypair, env);

  console.log("[utils] [createGayDungeon] gayProgram =>", gayProgram);

  const treasuryWithdrawalDestinationKey = treasuryWithdrawalDestination
    ? treasuryWithdrawalDestination
    : TREASURY_WALLET_KEY;

  const feeWithdrawalDestinationKey = feeWithdrawalDestination
    ? feeWithdrawalDestination
    : FEE_DESTINATION_WALLET_KEY;

  const treasuryMintKey = treasuryMint ? treasuryMint : WRAPPED_SOL_MINT;

  const treasuryWithdrawalDestinationAtaKey = treasuryMintKey.equals(
    WRAPPED_SOL_MINT
  )
    ? treasuryWithdrawalDestinationKey
    : (
        await getAtaForMint(treasuryMintKey, treasuryWithdrawalDestinationKey)
      )[0];

  console.log(
    "[utils] [createGayDungeon] treasuryWithdrawalDestinationKey =>",
    treasuryWithdrawalDestinationKey.toBase58()
  );
  console.log(
    "[utils] [createGayDungeon] feeWithdrawalDestinationKey =>",
    feeWithdrawalDestinationKey.toBase58()
  );
  console.log(
    "[utils] [createGayDungeon] treasuryMintKey =>",
    treasuryMintKey.toBase58()
  );
  console.log(
    "[utils] [createGayDungeon] treasuryWithdrawalDestinationAtaKey =>",
    treasuryWithdrawalDestinationAtaKey.toBase58()
  );

  const [gayDungeon, gayDungeonBump] = await getGayDungeon(
    keypair.publicKey,
    treasuryMintKey
  );

  const [feeAccount, feeAccountBump] = await getGayDungeonFeeAccount(
    gayDungeon
  );

  const [treasuryAccount, treasuryAccountBump] =
    await getGayDungeonTreasuryAccount(gayDungeon);

  console.log("[utils] [createGayDungeon] [gayDungeon, gayDungeonBump]  =>", [
    gayDungeon.toBase58(),
    gayDungeonBump,
  ]);

  console.log("[utils] [createGayDungeon] [feeAccount, feeAccountBump]  =>", [
    feeAccount.toBase58(),
    feeAccountBump,
  ]);

  console.log(
    "[utils] [createGayDungeon] [treasuryAccount, treasuryAccountBump] =>",
    [treasuryAccount.toBase58(), treasuryAccountBump]
  );

  const rpcArgs: CreateGayDungeonRPCArgs = {
    canChangeSalePrice,
    gayDungeonBump,
    gayDungeonFeePayerBump: feeAccountBump,
    gayDungeonTreasuryBump: treasuryAccountBump,
    requiresSignOff,
    sellerFeeBasisPoints,
  };

  const rpcAccount: CreateGayDungeonAccountArgs = {
    ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    authority: keypair.publicKey,
    feeWithdrawalDestination: feeWithdrawalDestinationKey,
    gayDungeon,
    gayDungeonFeeAccount: feeAccount,
    gayDungeonTreasury: treasuryAccount,
    payer: keypair.publicKey,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    treasuryMint: treasuryMintKey,
    treasuryWithdrawalDestination: treasuryWithdrawalDestinationAtaKey,
    treasuryWithdrawalDestinationOwner: treasuryWithdrawalDestinationKey,
  };

  console.log("[utils] [createGayDungeon] rpcArgs =>", rpcArgs);
  console.log("[utils] [createGayDungeon] rpcAccount =>", rpcAccount);

  const tx = await gayProgram.methods
    .createGayDungeon(rpcArgs as any)
    .accounts(rpcAccount as any)
    .signers([keypair])
    .rpc();

  console.log("[utils] [createGayDungeon] tx =>", tx);

  return gayDungeon;
};
