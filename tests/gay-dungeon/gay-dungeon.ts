import * as anchor from "@project-serum/anchor";
import { base58_to_binary } from "base58-js";
import { expect } from "chai";
import { initGayDungeon } from "./utils/account";
import { showGayDungeon } from "./utils/show-gay-dungeon";

describe("auction-house", () => {
  // Configure the client to use the local cluster.
  const env = "https://api.devnet.solana.com";

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

  before((done) => {
    (async () => {
      try {
        await initGayDungeon();
      } catch (error) {
        console.error("error while initializing => ", error);
      }

      done();
    })();
  });

  it("Should successfully create auction house", async () => {
    try {
      await showGayDungeon({
        keypair: jeeKeypair,
        env: "devnet",
        auctionHouse: jeeKeypair.publicKey,
        treasuryMint: null,
      });
    } catch (error) {
      expect(error.message).to.equal("error");
      console.error(error);
    }
  });
});
