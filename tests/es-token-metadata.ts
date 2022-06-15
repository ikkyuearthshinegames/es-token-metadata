import * as anchor from "@project-serum/anchor";
import { Program, Wallet } from "@project-serum/anchor";
import { EsTokenMetadata } from "../target/types/es_token_metadata";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE, mintTo } from '@solana/spl-token' // IGNORE THESE ERRORS IF ANY
const { SystemProgram } = anchor.web3

describe("es-token-metadata", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const myWallet = provider.wallet;
  const program = anchor.workspace.EsTokenMetadata as Program<EsTokenMetadata>;

  it("Create Metadata Account!", async () => {
    const lamports: number = await program.provider.connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    // minted token address
    const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    // metadata address
    // const metadataKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    // Mint token
    {
      console.log("Minting token...");

      // create ata address (minted token <- ata)
      const ata = await getAssociatedTokenAddress(
        mintKey.publicKey,
        myWallet.publicKey
      );
      console.log("myWallet:", myWallet.publicKey.toBase58());
      console.log("mintKey:", mintKey.publicKey.toBase58());
      console.log("ata:", ata.toBase58());
      console.log("\n");

      const tx = new anchor.web3.Transaction();

      // Use anchor to create an account from the mint key that we created
      const create_account_ix = anchor.web3.SystemProgram.createAccount({
        fromPubkey: myWallet.publicKey,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      });
      tx.add(create_account_ix);

      // Fire a transaction to create our mint account that is controlled by our anchor wallet
      const initialize_mint_ix = createInitializeMintInstruction(
        mintKey.publicKey,
        0,
        myWallet.publicKey,
        myWallet.publicKey
      );
      tx.add(initialize_mint_ix);

      // Create the ATA account that is associated with our mint on our anchor wallet
      const create_ata_ix = createAssociatedTokenAccountInstruction(
        myWallet.publicKey,
        ata,
        myWallet.publicKey,
        mintKey.publicKey
      );
      tx.add(create_ata_ix);

      // sends and create the transaction
      // console.log("Sending transaction...");
      const res = await anchor.AnchorProvider.env().sendAndConfirm(tx, [mintKey]);
      // console.log("res: ", res);

      {
        const account = {
          mintAuthority: myWallet.publicKey,
          mint: mintKey.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenAccount: ata,
          payer: myWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        };

        const tx = await program.methods.mintNft().accounts(account).rpc();
        // console.log("Transaction Signature: ", tx);
      }

      console.log("Mint token completed\n\n");
    }

    // Create Metadata Account.
    {
      const MY_PROGRAM_ID: anchor.web3.PublicKey = new anchor.web3.PublicKey("4cPZHiknrGUbDadU8n15D3GpvDfw1GbcvGoT3ccSg522");
      console.log("Generating PDA...");
      const getMetadata = async (mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> => {
        return (
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from("es-metadata"),
              MY_PROGRAM_ID.toBuffer(),
              mint.toBuffer(),
            ],
            MY_PROGRAM_ID
          )
        )[0];
      };
      const pda = await getMetadata(mintKey.publicKey);
      console.log("pda:", pda.toBase58());
      console.log("Generate PDA completed");

      console.log("Creating Metadata Account...");

      //console.log("metadataKey", metadataKey.publicKey.toBase58());
      const creators = [
        {
          address: pda,
          verified: false,
          share: new anchor.BN(0),
        },
      ];

      // Add 5 creators
      for (let i = 0; i < 5; ++i) {
        creators.push({
          address: myWallet.publicKey,
          verified: false,
          share: new anchor.BN(i),
        });
      }

      const data: any = {
        data: {
          name: "name_str",
          symbol: "symbol_str",
          uri: "uri_str",
          sellerFeeBasisPoints: 10,
          creators: creators
        },
        allowDirectCreatorWrites: false,
        isMutable: false
      };
      // logObject("data:", data);

      const account = {
        metadata: pda,
        payer: myWallet.publicKey,
        mint: mintKey.publicKey,
        mintAuthority: myWallet.publicKey,
        updateAuthority: myWallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      };
      // logObject("account:", account);

      {
        const tx = await program.methods.createMetadata(data)
          .accounts(account)
          //.signers([mintKey])
          .rpc();
        console.log("CreateMetadataAccount transaction signature", tx);
      }

      const metadata = await program.account.metadata.fetch(pda);
      logObject("metadata:", metadata);

      console.log("Create metadata completed\n\n");
    }
  });
});

function logObject(detail: String, obj: any) {
  if (obj != null) {
    console.log(detail + `\n${JSON.stringify(obj, null, 2)}\n`);
  } else {
    console.log(detail + `is null.\n`);
  }
}
