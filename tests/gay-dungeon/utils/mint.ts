import * as anchor from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ES_TOKEN_METADATA_PROGRAM } from "../../es-token-metadata/utils/constant";

export const mint = async (
  tokenMetadataProgram: anchor.Program,
  wallet: anchor.web3.Keypair
): Promise<{ res: string; mintKeyPair: anchor.web3.Keypair }> => {
  const lamports: number =
    await tokenMetadataProgram.provider.connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

  const mintKeyPair = anchor.web3.Keypair.generate();

  const ata = await getAssociatedTokenAddress(
    mintKeyPair.publicKey,
    wallet.publicKey
  );

  console.log("[mint] lamports =>", lamports);
  console.log("[mint] mintKeyPair =>", mintKeyPair.publicKey.toBase58());
  console.log("[mint] ata =>", ata.toBase58());

  const instructions = [
    //create account for mint key
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      lamports,
      newAccountPubkey: mintKeyPair.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: MINT_SIZE,
    }),

    //fire transaction to create mint account that controlled by anchor wallet (key)
    createInitializeMintInstruction(
      mintKeyPair.publicKey,
      0,
      wallet.publicKey,
      wallet.publicKey
    ),

    //create the ATA account assocciated with mint and anchor wallet
    createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      ata,
      wallet.publicKey,
      mintKeyPair.publicKey
    ),
  ];

  const tx = new anchor.web3.Transaction().add(...instructions);

  const res = await tokenMetadataProgram.provider.sendAndConfirm!(tx, [
    mintKeyPair,
  ]);

  const account = {
    mint: mintKeyPair.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    tokenAccount: ata,
    payer: wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  };

  const tx_mint = await tokenMetadataProgram.methods
    .mintNft()
    .accounts(account)
    .rpc();

  return {
    res: tx_mint,
    mintKeyPair,
  };
};

export const getMetadata = async (
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("esmetadata"),
        ES_TOKEN_METADATA_PROGRAM.toBuffer(),
        mint.toBuffer(),
      ],
      ES_TOKEN_METADATA_PROGRAM
    )
  )[0];
};
