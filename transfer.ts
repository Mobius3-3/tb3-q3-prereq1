import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";
import wallet from "./dev-wallet.json";
import prompt from "prompt-sync";

// Import our dev wallet keypair from the wallet file
const from = Keypair.fromSecretKey(new Uint8Array(wallet));
// Define our Turbin3 public key
const to = new PublicKey("5MWpSXNiS3coFVuzSFQca2Y8tDfUv9BqpUFM4UrJQQ41");

// Create a Solana devnet connection
const connection = new Connection("https://api.devnet.solana.com");

async function sendTest() {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: LAMPORTS_PER_SOL / 100, // 0.01 SOL
            })
        );
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        transaction.feePayer = from.publicKey;
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );
        console.log(`0.01 SOL sent! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (e) {
        console.error(`Oops, something went wrong with 0.01 SOL test: ${e}`);
    }
}

async function sendAll() {
    try {
        // Get balance of dev wallet
        const balance = await connection.getBalance(from.publicKey);
        // Create a test transaction to calculate fees
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance,
            })
        );
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        transaction.feePayer = from.publicKey;
        // Calculate exact fee rate to transfer entire SOL amount out of account minus fees
        const fee = (await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')).value || 0;
        // Remove our transfer instruction to replace it
        transaction.instructions.pop();
        // Now add the instruction back with correct amount of lamports
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance - fee,
            })
        );
        // Sign transaction, broadcast, and confirm
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );
        console.log(`All SOL sent! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`);
    }
}

// CLI selection
const p = prompt();
console.log("Select transfer mode:");
console.log("1. Send 0.01 SOL (test)");
console.log("2. Send all SOL minus fees");
const choice = p("Enter 1 or 2: ");

if (choice === "1") {
    sendTest();
} else if (choice === "2") {
    sendAll();
} else {
    console.log("Invalid choice. Exiting.");
}