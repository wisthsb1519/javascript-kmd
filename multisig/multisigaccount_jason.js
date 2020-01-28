const algosdk = require('algosdk');
const token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const server = "http://127.0.0.1";
const port = 4001;


const keypress = async() => {
    process.stdin.setRawMode(true)
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false)
        resolve()
    }))
}


(async() => {
    //create an account
    var account1 = algosdk.generateAccount();
    console.log(account1.addr);
    //create an account
    var account2 = algosdk.generateAccount();
    console.log(account2.addr);
    //create an account
    var account3 = algosdk.generateAccount();
    console.log(account3.addr);

    //Setup teh parameters for the multisig account
    const mparams = {
        version: 1,
        threshold: 2,
        addrs: [
            account1.addr,
            account2.addr,
            account3.addr,
        ],
    };

    var multsigaddr = algosdk.multisigAddress(mparams);
    console.log("Multisig Address: " + multsigaddr);
    //Pause execution to allow using the dispenser on testnet to put tokens in account
    console.log('Make sure address above has tokens using the dispenser');
    await keypress();
    try {
        let algodclient = new algosdk.Algod(token, server, port);

        //Get the relevant params from the algod
        let params = await algodclient.getTransactionParams();
        let endRound = params.lastRound + parseInt(1000);
        //example of how to write an object into the notefield

        //create a transaction
        let txn = {
            "from": multsigaddr,
            "to": "7GBK5IJCWFPRWENNUEZI3K4CSE5KDIRSR55KWTSDDOBH3E3JJCKGCSFDGQ",
            "fee": params.fee,
            "amount": 200000,
            "firstRound": params.lastRound,
            "lastRound": endRound,
            "genesisID": params.genesisID,
            "genesisHash": params.genesishashb64,
            "note": new Uint8Array(0)
        };
        //Sign wiith first signature
        let rawSignedTxn = algosdk.signMultisigTransaction(txn, mparams, account1.sk).blob;
        //sign with second account
        let twosigs = algosdk.appendSignMultisigTransaction(rawSignedTxn, mparams, account2.sk).blob;
        //submit the transaction
        let tx = (await algodclient.sendRawTransaction(twosigs));
        console.log("Transaction : " + tx.txId);

    } catch (err) {
        console.log(err);
    }
})().then(process.exit)