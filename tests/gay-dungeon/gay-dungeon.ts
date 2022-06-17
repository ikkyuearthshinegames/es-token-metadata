import * as anchor from "@project-serum/anchor";
import { base58_to_binary } from "base58-js";
import { expect } from "chai";
import { initEsTokenMetadata } from "../es-token-metadata/utils/account";
import { initGayDungeon } from "./utils/account";
import { showGayDungeon } from "./utils/show-gay-dungeon";

describe("auction-house", () => {
  // Configure the client to use the local cluster.
  const env = "devnet";

  const jeeKeypair: anchor.web3.Keypair = new anchor.web3.Keypair({
    publicKey: new anchor.web3.PublicKey(
      "ESz5bto4fkF68grek4cAhsfn7r9XBnG85RLZLkJRAzbE"
    ).toBuffer(),
    secretKey: base58_to_binary(
      "4KVhGLcLJJqppjZb9MbDZSXCJp1Qh8Xr9sbVTeCboGrRRCaeJ2SvNkuGvs7kW5wPYJfSrjs75fcSLT3d86ncx9yN"
    ),
  });

  const buyerKeypair: anchor.web3.Keypair = new anchor.web3.Keypair({
    publicKey: new anchor.web3.PublicKey(
      "6TmKV9CajmPkjMM4AWooTgw9QELQqGaQZwg8zWjaRNTr"
    ).toBuffer(),
    secretKey: base58_to_binary(
      "55PtQoFR8QKxV1aFANHymTbLA9xWqgs7fQPxDvQSTE54WXS766vR1f1cmNKJzjLuhSTQtj5fEtSVQ49dh5opKWdW"
    ),
  });

  let _walletKeyPair: anchor.web3.Keypair;
  let _gayDungeonKey: anchor.web3.PublicKey;
  let _esTokenMetaDataKey: anchor.web3.PublicKey;
  let _mintKeypair: anchor.web3.Keypair;

  before((done) => {
    (async () => {
      try {
        const { walletKeyPair, gayDungeon } = await initGayDungeon();

        _walletKeyPair = walletKeyPair;
        _gayDungeonKey = gayDungeon;
      } catch (error) {
        console.error("error while initGayDungeon => ", error);
      }

      try {
        const { esTokenMetaDataKey, mintKeypair } = await initEsTokenMetadata(
          _walletKeyPair,
          env
        );
        _esTokenMetaDataKey = esTokenMetaDataKey;
        _mintKeypair = mintKeypair;
      } catch (error) {
        console.error("error while initEsTokenMetadata => ", error);
      }

      done();
    })();
  });

  it("Should successfully create Gay Dungeon", async () => {
    try {
      await showGayDungeon({
        walletKeyPair: _walletKeyPair,
        env: env,
        gayDungeonKey: _gayDungeonKey,
        treasuryMint: null,
      });
    } catch (error) {
      console.error("error while showGayDungeon => ", error);
    }
  });

  it("Should execute `sell` function", async () => {
    try {
    } catch (error) {
      console.error("error while showGayDungeon => ", error);
    }
  });
});
