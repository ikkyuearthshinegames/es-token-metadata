import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import {
  getMetadata,
  loadEsTokenMetadataProgram,
} from "../../es-token-metadata/utils/account";
import {
  addSOLToWallet,
  getGayDungeonProgramAsSigner,
  getGayDungeonTradeState,
  loadGayDungeonProgram,
} from "./account";
import {
  GayDungeonObject,
  SellGayDungeonAccountArgs,
  SellGayDungeonArgs,
  SellGayDungeonRPCArgs,
} from "./interfaces";
import { getPriceWithMantissa } from "./misc";

export const sell = async (args: SellGayDungeonArgs) => {
  const {
    buyPrice,
    env,
    gayDungeonKey,
    gayDungeonSigns,
    mintKey,
    tokenSize,
    walletKeypair,
  }: SellGayDungeonArgs = args;

  console.log(
    "[sell] || walletKeypair => ",
    walletKeypair.publicKey.toBase58()
  );

  //await addSOLToWallet(walletKeypair);

  const gayDungeonProgram = await loadGayDungeonProgram(walletKeypair, env);
  console.log(
    "[sell] || gayDungeonProgram => ",
    gayDungeonProgram.programId.toBase58()
  );

  const gayDungeonObj: GayDungeonObject =
    (await gayDungeonProgram.account.gayDungeon.fetchNullable(
      gayDungeonKey
    )) as GayDungeonObject;

  if (gayDungeonObj === null)
    throw new Error("auction house account not found");

  const priceFromBuyPrice = await getPriceWithMantissa(
    buyPrice,
    mintKey,
    walletKeypair,
    gayDungeonProgram
  );

  const buyPriceAdjusted = new BN(priceFromBuyPrice);

  console.log("[sell] || buyPriceAdjusted => ", buyPriceAdjusted.toNumber());

  const priceFromTokenSize = await getPriceWithMantissa(
    tokenSize,
    mintKey,
    walletKeypair,
    gayDungeonProgram
  );

  const tokenSizeAdjusted = new BN(priceFromTokenSize);

  console.log("[sell] || tokenSizeAdjusted => ", tokenSizeAdjusted.toNumber());

  const tokenAccountKey: anchor.web3.PublicKey =
    await getAssociatedTokenAddress(mintKey, walletKeypair.publicKey);

  console.log("[sell] || tokenAccountKey => ", tokenAccountKey.toBase58());

  const [programAsSigner, programAsSignerBump] =
    await getGayDungeonProgramAsSigner();

  console.log(
    "[sell] || programAsSigner => ",
    programAsSigner.toBase58(),
    " with bump value of ",
    programAsSignerBump
  );

  console.log("[sell] || tradestate seeds => ", {
    auctionHouse: gayDungeonKey,
    wallet: walletKeypair.publicKey,
    tokenAccount: tokenAccountKey,
    treasuryMint: gayDungeonObj.treasuryMint,
    tokenMint: mintKey,
    tokenSize: tokenSizeAdjusted,
    buyPrice: buyPriceAdjusted,
  });

  const [sellerTradeState, sellerTradeStateBump] =
    await getGayDungeonTradeState({
      gayDungeonKey: gayDungeonKey,
      walletKey: walletKeypair.publicKey,
      tokenAccount: tokenAccountKey,
      treasuryMint: gayDungeonObj.treasuryMint,
      tokenMint: mintKey,
      tokenSize: tokenSizeAdjusted,
      buyPrice: buyPriceAdjusted,
    });

  console.log(
    "[sell] || tradeState => ",
    sellerTradeState.toBase58(),
    " with bump value of ",
    sellerTradeStateBump
  );

  const esTokenMetaDataProgram = await loadEsTokenMetadataProgram(
    walletKeypair,
    env
  );

  console.log(
    "[sell] || esTokenMetaDataProgram => ",
    esTokenMetaDataProgram.programId.toBase58()
  );

  const [esTokenMetaDataKey, esTokenMetaDataBump] = await getMetadata(
    esTokenMetaDataProgram,
    mintKey
  );
  console.log(
    "[sell] || esTokenMetaDataKey => ",
    esTokenMetaDataKey.toBase58(),
    esTokenMetaDataBump
  );

  const sellArgs: SellGayDungeonRPCArgs = {
    metadataBump: esTokenMetaDataBump,
    programAsSignerBump: programAsSignerBump,
    buyerPrice: buyPriceAdjusted,
    tokenSize: tokenSizeAdjusted,
  };

  console.log("[sell] || sellArgs => ", sellArgs);

  const sellAccount: SellGayDungeonAccountArgs = {
    authority: gayDungeonObj.authority,
    gayDungeon: gayDungeonKey,
    metadataAccount: esTokenMetaDataKey,
    gayDungeonFeeAccount: gayDungeonObj.gayDungeonFeeAccount,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    sellerTradeState: sellerTradeState,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenAccount: tokenAccountKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    wallet: walletKeypair.publicKey,
  };

  console.log("[sell] || sellAccount => ", sellAccount);

  const tx = await gayDungeonProgram.methods
    .sell(
      esTokenMetaDataBump,
      programAsSignerBump,
      buyPriceAdjusted,
      tokenSizeAdjusted
    )
    .accounts(sellAccount as any)
    .signers([walletKeypair])
    .rpc();

  console.log("[sell] || tx => ", tx);
};
