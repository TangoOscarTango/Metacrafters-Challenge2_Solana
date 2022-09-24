// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        214, 221, 118, 137, 146, 238, 161, 50, 223, 227, 241,
        6, 227, 161, 12, 230, 6, 41, 215, 216, 34, 117,
        139, 227, 178, 141, 63, 157, 18, 66, 56, 26, 211,
        184, 19, 91, 65, 7, 197, 123, 170, 89, 211, 192,
        98, 192, 118, 13, 52, 246, 52, 108, 81, 166, 145,
        193, 139, 127, 241, 117, 140, 241, 130, 133
    ]
);

const transferHalfSol = async () => {
    console.log("This code will airdrop 2 SOL to the sender wallet and then split the sender wallet's total balance with the target wallet.\n");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // The desired SOL airdrop value. Default is 2 SOL
    var airdropValue = 2 * LAMPORTS_PER_SOL;

    // Airdrop <airdropValue> amount of SOL to the sender wallet
    await airDropToWallet(airdropValue, from);

    // The desired amount of SOL to send to the recipient. Default is 50% of total SOL
    var SOLtoSend = await getWalletBalance(from) / 2;
    console.log("SOL to send: " + SOLtoSend / 1000000000);

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: parseInt(SOLtoSend)
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('\nSending ' + SOLtoSend / 1000000000 + ' SOL. Signature is', signature);
    console.log("\n" + SOLtoSend / 1000000000 + " SOL sent from: ");
    await getWalletBalance(from);
    console.log("To: ");
    await getWalletBalance(to);
}

// Get the wallet balance from a given public key
const getWalletBalance = async (walletPublicKey) => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        //console.log("Connection object is:", connection);

        // Get the input wallet's balance
        const walletBalance = await connection.getBalance(
            walletPublicKey.publicKey
        );
        console.log(walletPublicKey.publicKey + ` - balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
        return walletBalance;
    } catch (err) {
        console.log(err);
    }
};

// Airdrop the specified amount of SOL to the specified target wallet.
const airDropToWallet = async (_airdropValue, _targetWallet) => {
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // Aidrop <airdropvalue> # of SOL to Sender wallet
    console.log("Airdopping " + _airdropValue / 1000000000 + " SOL to target wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(_targetWallet.publicKey),
        _airdropValue
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log(_airdropValue / 1000000000 + " SOL airdrop completed!");
    //await getWalletBalance(_targetWallet);
};

transferHalfSol();
