import * as anchor from "@project-serum/anchor";
import { Keypair, Cluster } from "@solana/web3.js";

import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ES_TOKEN_METADATA_PROGRAM,
  ES_TOKEN_METADATA_PROGRAM_PREFIX,
} from "./constant";
import { Creator } from "./interface";
import { addSOLToWallet } from "../../gay-dungeon/utils/account";

export const loadEsTokenMetadataProgram = async (
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

  console.log("fetching IDL using program ID => ", ES_TOKEN_METADATA_PROGRAM);
  const idl = await anchor.Program.fetchIdl(
    ES_TOKEN_METADATA_PROGRAM,
    provider
  );

  return new anchor.Program(idl, ES_TOKEN_METADATA_PROGRAM, provider);
};

export const getMetadata = async (
  esTokenMetadataProgram: anchor.Program,
  mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(ES_TOKEN_METADATA_PROGRAM_PREFIX),
        esTokenMetadataProgram.programId.toBuffer(),
        mint.toBuffer(),
      ],
      esTokenMetadataProgram.programId
    )
  )[0];
};

export const initEsTokenMetadata = async (
  walletKeyPair: anchor.web3.Keypair,
  env: string
): Promise<{
  mintKeypair: anchor.web3.Keypair;
  esTokenMetaDataKey: anchor.web3.PublicKey;
}> => {
  console.log("----------- --------------------- ------------");
  console.log("----------- initEsTokenMetadata   ------------");
  console.log("----------- --------------------- ------------");
  await addSOLToWallet(walletKeyPair);

  const esTokenMetadataProgram = await loadEsTokenMetadataProgram(
    walletKeyPair,
    env
  );

  const lamports: number =
    await esTokenMetadataProgram.provider.connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

  const mintKeyPair = anchor.web3.Keypair.generate();

  const ata = await getAssociatedTokenAddress(
    mintKeyPair.publicKey,
    walletKeyPair.publicKey
  );

  console.log("[initEsTokenMetadata] lamports =>", lamports);
  console.log(
    "[initEsTokenMetadata] mintKeyPair =>",
    mintKeyPair.publicKey.toBase58()
  );
  console.log("[initEsTokenMetadata] ata =>", ata.toBase58());

  const instructions = [
    //create account for mint key
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: walletKeyPair.publicKey,
      lamports,
      newAccountPubkey: mintKeyPair.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: MINT_SIZE,
    }),

    //fire transaction to create mint account that controlled by anchor wallet (key)
    createInitializeMintInstruction(
      mintKeyPair.publicKey,
      0,
      walletKeyPair.publicKey,
      walletKeyPair.publicKey
    ),

    //create the ATA account assocciated with mint and anchor wallet
    createAssociatedTokenAccountInstruction(
      walletKeyPair.publicKey,
      ata,
      walletKeyPair.publicKey,
      mintKeyPair.publicKey
    ),
  ];

  const tx = new anchor.web3.Transaction().add(...instructions);

  console.log("[initEsTokenMetadata] tx =>", tx);

  const res = await esTokenMetadataProgram.provider.sendAndConfirm!(tx, [
    mintKeyPair,
  ]);

  console.log("[initEsTokenMetadata] res =>", res);

  const mintAccount = {
    mintAuthority: walletKeyPair.publicKey,
    mint: mintKeyPair.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    tokenAccount: ata,
    payer: walletKeyPair.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  };

  console.log("[initEsTokenMetadata] mintAccount =>", mintAccount);

  const es_tx = await esTokenMetadataProgram.methods
    .mintNft()
    .accounts(mintAccount)
    .rpc();

  console.log("[initEsTokenMetadata] es_tx =>", es_tx);

  const metadataKey = await getMetadata(
    esTokenMetadataProgram,
    mintKeyPair.publicKey
  );
  console.log("[initEsTokenMetadata] metadataKey:", metadataKey.toBase58());

  const creators: Creator[] = [
    {
      address: walletKeyPair.publicKey,
      verified: false,
      share: new anchor.BN(10),
    },
  ];

  // Add creators
  [10, 30, 40, 10].map((share) => {
    const _walletKeyPair = anchor.web3.Keypair.generate();
    creators.push({
      address: _walletKeyPair.publicKey,
      verified: false,
      share: new anchor.BN(share),
    });
  });

  const esTokenMeta = {
    data: {
      name: "name_str",
      symbol: "symbol_str",
      uri: "uri_str",
      sellerFeeBasisPoints: 10,
      creators: creators,
    },
    allowDirectCreatorWrites: false,
    isMutable: true,
  };

  const tokenAccounts = {
    metadata: metadataKey,
    payer: walletKeyPair.publicKey,
    mint: mintKeyPair.publicKey,
    mintAuthority: walletKeyPair.publicKey,
    updateAuthority: walletKeyPair.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  };

  const tx_token = await esTokenMetadataProgram.methods
    .createMetadata(esTokenMeta)
    .accounts(tokenAccounts)
    .rpc();

  console.log("[initEsTokenMetadata] tx_token =>", tx_token);
  console.log("Create metadata completed\n\n");

  return {
    esTokenMetaDataKey: metadataKey,
    mintKeypair: mintKeyPair,
  };
};
