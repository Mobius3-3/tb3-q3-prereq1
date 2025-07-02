import bs58 from 'bs58';
import prompt from 'prompt-sync';

// Function to convert base58 string to wallet bytes
function base58ToWallet(): void {
    console.log("Enter your base58 wallet string:");
    const base58Input = prompt()(""); // Get input from user
    
    try {
        const wallet = bs58.decode(base58Input);
        console.log("Wallet bytes:", Array.from(wallet));
    } catch (error) {
        console.error("Error decoding base58 string:", error);
    }
}

// Function to convert wallet bytes to base58 string
function walletToBase58(): void {
    // Example wallet bytes (you can modify this or make it input-based)
    console.log("Enter wallet bytes as a comma-separated list (e.g. 1,2,3,...):");
    const input = prompt()("");
    
    try {
        const wallet = input.split(',').map(s => parseInt(s.trim(), 10));
        if (wallet.some(isNaN)) {
            throw new Error("Invalid input: all values must be numbers.");
        }
        const base58 = bs58.encode(Buffer.from(wallet));
        console.log("Base58 string:", base58);
    } catch (error) {
        console.error("Error encoding to base58:", error);
    }
}

// Main CLI function
function main(): void {
    console.log("Wallet Format Converter");
    console.log("1. Convert base58 to wallet bytes");
    console.log("2. Convert wallet bytes to base58");
    console.log("3. Exit");
    
    const choice = prompt()("Enter your choice (1-3): ");
    
    switch (choice) {
        case "1":
            base58ToWallet();
            break;
        case "2":
            walletToBase58();
            break;
        case "3":
            console.log("Goodbye!");
            break;
        default:
            console.log("Invalid choice. Please try again.");
    }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
    main();
}

export { base58ToWallet, walletToBase58 };