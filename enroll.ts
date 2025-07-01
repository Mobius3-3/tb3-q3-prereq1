import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, Wallet, AnchorProvider } from "@coral-xyz/anchor";
import { IDL, Turbin3Prereq } from "./programs/Turbin3_prereq";
import wallet from "./Turbin3-wallet.json";
import fs from "fs";

const SYSTEM_PROGRAM_ID = SystemProgram.programId;
// Github account
const  github_username= "Mobius3-3";
const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

// Create a Solana devnet connection
const connection = new Connection("https://api.devnet.solana.com");
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

const provider = new AnchorProvider(connection, new Wallet(keypair), {
    commitment: "confirmed"
  });
  
const program: Program<Turbin3Prereq> = new Program(IDL, provider);

const account_seeds = [
    Buffer.from([
      112,
      114,
      101,
      114,
      101,
      113,
      115
      ]),
    keypair.publicKey.toBuffer(),
  ];
  
const [account_key, account_bump] = 
  PublicKey.findProgramAddressSync(account_seeds, program.programId);
  
(async () => {
  try {
    const txhash_1 = await program.methods
      .initialize(github_username)
      .accountsPartial({
        user: keypair.publicKey,
        account: account_key,
        system_program: SYSTEM_PROGRAM_ID,
      })
      .signers([keypair])
      .rpc();

    console.log(`Success! Check your TX: https://explorer.solana.com/tx/${txhash_1}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();

const mintCollection = new PublicKey("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");
const mintTs = Keypair.generate();
fs.writeFileSync("mint-wallet.json", JSON.stringify(Array.from(mintTs.secretKey)));

// Constant seed as raw bytes
const authority_seeds = [Buffer.from([99, 111, 108, 108, 101, 99, 116, 105, 111, 110]), mintCollection.toBuffer()]; // "collection"

// Derive PDA
const [authority_key, authority_bump] = PublicKey.findProgramAddressSync(authority_seeds, program.programId);

(async () => {
  try {
    const txhash_2 = await program.methods
      .submitTs()
      .accountsPartial({
        user: keypair.publicKey,
        account: account_key,
        mint: mintTs.publicKey, // 
        collection: mintCollection,
        authority: authority_key, //
        mpl_core_program: MPL_CORE_PROGRAM_ID,
        system_program: SYSTEM_PROGRAM_ID,
      })
      .signers([keypair, mintTs])
      .rpc();

    console.log(`Success! Check your TX: https://explorer.solana.com/tx/${txhash_2}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();

