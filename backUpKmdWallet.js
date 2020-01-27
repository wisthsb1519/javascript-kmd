const algosdk = require('algosdk');

//Retrieve the token, server and port values for your installation in the kmd.net
//and kmd.token files within the kmd directory
const kmdtoken = "e4a0aa0518da921bae3f27f40f443a4e154a1c80f25f7759db7767e04d73c06c";
const kmdserver = "http://127.0.0.1";
const kmdport = 7833;

const kmdclient = new algosdk.Kmd(kmdtoken, kmdserver, kmdport);


  (async () => {
    //get a list of the wallets and find the one we are looking for
    var walletid = null;
    let wallets = (await kmdclient.listWallets()).wallets;
    console.log("List Wallet.", wallets);
    wallets.forEach(function (arrayItem) {
        console.log(arrayItem.name);
        if( arrayItem.name === 'MyTestWallet3'){
            walletid = arrayItem.id;
        }
    });
    //Get a wallet handle
    let wallethandle = (await kmdclient.initWalletHandle(walletid, "testpassword")).wallet_handle_token;
    console.log("Got wallet handle.", wallethandle);
    //export the master derivation key
    let mdk = (await kmdclient.exportMasterDerivationKey(wallethandle, "testpassword")).master_derivation_key;
    console.log("mdk.", mdk);
    //get backup phrase to store offline in a safe place
    console.log("Mnemonic", algosdk.masterDerivationKeyToMnemonic(mdk));
})().catch(e => {
    console.log(e);
});