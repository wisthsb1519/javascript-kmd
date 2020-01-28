const algosdk = require('algosdk');

//Retrieve the token, server and port values for your installation in the algod.net
//and algod.token files within the data directory
const token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const server = "http://127.0.0.1";
const port = 4001;

// Structure for changing blockchain params
var cp = {
    fee: 0, 
    firstRound: 0,  
    lastRound: 0, 
    genID: "",
    genHash: ""    
}
//Utility function to update params from blockchain
var getChangingParms = async function( algodclient ) {
    let params = await algodclient.getTransactionParams();
    cp.firstRound = params.lastRound;
    cp.lastRound = cp.firstRound + parseInt(1000);
    let sfee = await algodclient.suggestedFee();
    cp.fee = sfee.fee;
    cp.genID = params.genesisID;
    cp.genHash = params.genesishashb64;
}


// Function used to wait for a tx confirmation
var waitForConfirmation = async function(algodclient, txId) {
    while (true) {
        b3 = await algodclient.pendingTransactionInformation(txId);
        if (b3.round != null && b3.round > 0) {
            //Got the completed Transaction
            console.log("Transaction " + b3.tx + " confirmed in round " + b3.round);
            break;
        }
    }
};

//Recover accounts used in example
var account1_mnemonic = "face pluck remind spawn annual vivid tired margin romance film leopard brand park adjust paddle excuse layer level then book video exact crumble abstract garlic";
var account2_mnemonic = "era upon mistake prevent furnace under alter decrease remember child great royal wash ancient silent text obscure woman cruel debris timber ecology rent abstract autumn";
var account3_mnemonic = "reflect rude enroll control dad drama debate come saddle borrow broccoli avocado trophy lottery place salute illegal bone present divert region evoke surge abandon expose"

var recoveredAccount1 = algosdk.mnemonicToSecretKey(account1_mnemonic);
var recoveredAccount2 = algosdk.mnemonicToSecretKey(account2_mnemonic);
var recoveredAccount3 = algosdk.mnemonicToSecretKey(account3_mnemonic);
console.log(recoveredAccount1.addr);
console.log(recoveredAccount2.addr);
console.log(recoveredAccount3.addr);


//instantiate the algod wrapper
let algodclient = new algosdk.Algod(token, server, port);
//submit the transaction
(async() => {
    
    
    // Asset Creation:
    // The first transaciton is to create a new asset
    // Get last round and suggested tx fee.
    // We use these to get the latest round and tx fees.
    // These parameters will be required before every 
    // Transaction
    // We will account for changing transaction parameters
    // before every transaction in this example.
    await getChangingParms(algodclient);
    let note = undefined; // arbitrary data to be stored in the transaction; here, none is stored

    // create the asset
    let addr = recoveredAccount1.addr; 
    let defaultFrozen = false;
    let totalIssuance = 100; 
    let unitName = "MYTST6"; 
    let assetName = "testcoin6"; 
    let assetURL = "http://someurl"; 
    let assetMetadataHash = "16efaa3924a6fd9d3a4824799a4ac65d"; 
    let manager = recoveredAccount2.addr; 
    let reserve = recoveredAccount2.addr;
    let freeze = recoveredAccount2.addr; 
    let clawback = recoveredAccount2.addr; 
    let decimals = 0;

    // signing and sending "txn" allows "addr" to create an asset
    let txn = algosdk.makeAssetCreateTxn(addr, cp.fee, cp.firstRound, cp.lastRound, note,
        cp.genHash, cp.genID, totalIssuance, decimals, defaultFrozen, manager, reserve, freeze, clawback,
        unitName, assetName, assetURL, assetMetadataHash);

    let rawSignedTxn = txn.signTxn(recoveredAccount1.sk)
    let tx = (await algodclient.sendRawTransaction(rawSignedTxn));
    console.log("Transaction : " + tx.txId);
    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, tx.txId);
    let ptx = await algodclient.pendingTransactionInformation(tx.txId);
    console.log( ptx.txresults.createdasset );

    let assetID = ptx.txresults.createdasset;


    // Change Asset Configuration:
    // Change the manager using an asset configuraiton transaction

    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    await getChangingParms(algodclient);

    // Asset configuration specific parameters
    // all other values are the same so we leave 
    // Them set.
    // specified address can change reserve, freeze, clawback, and manager.
    // You must respecify existing addresses to keep them the same; 
    // leaving a field blank is the same as turning that feature off for this asset.

    manager = recoveredAccount1.addr;

    // Note that the change has to come from the existing manager
    let ctxn = algosdk.makeAssetConfigTxn(recoveredAccount2.addr, cp.fee, 
        cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID,
        assetID, manager, reserve, freeze, clawback);

    // This transaction must be signed by the current manager
    rawSignedTxn = ctxn.signTxn(recoveredAccount2.sk)
    let ctx = (await algodclient.sendRawTransaction(rawSignedTxn));
    console.log("Transaction : " + ctx.txId);
    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, ctx.txId);
 
    //Get the asset information for the newly changed asset
    let assetInfo = await algodclient.assetInformation(assetID);
    //The manager should now be the same as the creator
    console.log(assetInfo);

    // Opting in to an Asset:
    // Opting in to transact with the new asset.
    // Accounts that want to recieve a new asset
    // have to opt in. To do this they send an asset transfer
    // of the new asset to themseleves 
    // In this example we are setting up the 3rd recovered account to 
    // receive the new asset
    let sender = recoveredAccount3.addr;
    let recipient = sender;
    // We set revocationTarget to undefined as 
    // This is not a clawback operation
    let revocationTarget = undefined;
    // CloseReaminerTo is set to undefined as
    // we are not closing out an asset
    let closeRemainderTo = undefined;
    // We are sending 0 assets
    amount = 0;

    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    await getChangingParms(algodclient);

    // signing and sending "txn" allows sender to begin accepting asset specified by creator and index
    let opttxn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
        cp.fee, amount, cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID, assetID);

    // Must be signed by the account wishing to opt in to the asset    
    rawSignedTxn = opttxn.signTxn(recoveredAccount3.sk);
    let opttx = (await algodclient.sendRawTransaction(rawSignedTxn));
    console.log("Transaction : " + opttx.txId);
    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, opttx.txId);

    //You should now see the new asset listed in the account information with a 0 balance for the asset
    act = await algodclient.accountInformation(recoveredAccount3.addr);
    console.log("Account Information for: " + JSON.stringify(act.assets));

    // Transfer New Asset:
    // Now that account3 can recieve the new tokens 
    // we can tranfer tokens in from the creator
    // to account3
    sender = recoveredAccount1.addr;
    recipient = recoveredAccount3.addr;
    revocationTarget = undefined;
    closeRemainderTo = undefined;
    //Amount of the asset to transfer
    amount = 10;

    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    await getChangingParms(algodclient);

    // signing and sending "txn" will send "amount" assets from "sender" to "recipient"
    let xtxn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
        cp.fee, amount, cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID, assetID);
    // Must be signed by the account sending the asset  
    rawSignedTxn = xtxn.signTxn(recoveredAccount1.sk)
    let xtx = (await algodclient.sendRawTransaction(rawSignedTxn));
    console.log("Transaction : " + xtx.txId);
    
    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, xtx.txId);

    // You should now see the 10 units of the asset listed in the account information
    act = await algodclient.accountInformation(recoveredAccount3.addr);
    console.log("Account Information for: " + JSON.stringify(act.assets));

    // The asset was created and configured to allow freezing an account
    // If the freeze address is set "", it will no longer be possible to do this.
    // In this example we will now freeze account3 from transacting with the 
    // The newly created asset. 
    // The freeze transaction is sent from the freeze acount
    // Which in this example is account2 
    from = recoveredAccount2.addr;
    freezeTarget = recoveredAccount3.addr;
    freezeState = true;

    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    await getChangingParms(algodclient);


    // The freeze transaction needs to be signed by the freeze account
    let ftxn = algosdk.makeAssetFreezeTxn(from, cp.fee, cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID,
        assetID, freezeTarget, freezeState)

    // Must be signed by the freeze account   
    rawSignedTxn = ftxn.signTxn(recoveredAccount2.sk)
    let ftx = (await algodclient.sendRawTransaction(rawSignedTxn));
    console.log("Transaction : " + ftx.txId);
    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, ftx.txId);

    // You should now see the asset is frozen listed in the account information
    act = await algodclient.accountInformation(recoveredAccount3.addr);
    console.log("Account Information for: " + JSON.stringify(act.assets));

    // Revoke and Asset:
    // The asset was also created with the ability for it to be revoked by 
    // the clawbackaddress. If the asset was created or configured with the clawbackaddress set to "",
    // clawback functionality would not be possible. This also applies to the freeze address.
    // We will now clawback the 10 assets in account3. account2
    // is the clawbackaccount and must sign the transaction
    // The sender will be be the clawback adress.
    // the recipient will also be be the creator in this case
    // that is account3
    sender = recoveredAccount2.addr;
    recipient = recoveredAccount1.addr;
    revocationTarget = recoveredAccount3.addr;
    closeRemainderTo = undefined;
    amount = 10;
   
    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    await getChangingParms(algodclient);

    // signing and sending "txn" will send "amount" assets from "revocationTarget" to "recipient",
    // if and only if sender == clawback manager for this asset
    let rtxn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
        cp.fee, amount, cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID, assetID);
    // Must be signed by the account that is the clawback address    
    rawSignedTxn = rtxn.signTxn(recoveredAccount2.sk)
    let rtx = (await algodclient.sendRawTransaction(rawSignedTxn));
    console.log("Transaction : " + rtx.txId);
    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, rtx.txId);

    // You should now see 0 assets listed in the account information
    // for the third account
    console.log("Asset ID: " + assetID);
    act = await algodclient.accountInformation(recoveredAccount3.addr);
    console.log("Account Information for: " + JSON.stringify(act.assets));

    // Destroy and Asset:
    // All of the created assets should now be back in the creators
    // Account so we can delete the asset.
    // If this is not the case the asset deletion will fail
 
    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example
    await getChangingParms(algodclient);

    // The address for the from field must be the manager account
    // Which is currently the creator addr1
    addr = recoveredAccount1.addr;

    // if all assets are held by the asset creator,
    // the asset creator can sign and issue "txn" to remove the asset from the ledger. 
    let dtxn = algosdk.makeAssetDestroyTxn(addr, cp.fee, cp.firstRound, cp.lastRound, note, cp.genHash, cp.genID, assetID);
    // The transaction must be signed by the manager which 
    // is currently set to account1
    rawSignedTxn = dtxn.signTxn(recoveredAccount1.sk)
    let dtx = (await algodclient.sendRawTransaction(rawSignedTxn));
    console.log("Transaction : " + dtx.txId);
    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, dtx.txId);

    // The account3 and account1 should no longer contain the asset as it has been destroyed
    console.log("Asset ID: " + assetID);
    act = await algodclient.accountInformation(recoveredAccount3.addr);
    console.log("Account Information for: " + JSON.stringify(act.assets));


})().catch(e => {
    console.log(e);
    console.trace();
});