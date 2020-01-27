// this file restores a kmd wallet from the wallet mnemonic that converts the mn to the master derivation key (mkd)
// using mnemonicToMasterDerivationKey() and then recreate (restore) the wallet using createWallet() that takes the mdk as an arg
// and you ultimately need the wallethandle to pass into generateKey (which is the method that generates kmd-based accounts)
// and to get the wallethandle you need to pass in the walletid into the initiWalletHandle() method which spits out the wallethandle

const algosdk = require('algosdk');

//Retrieve the token, server and port values for your installation in the kmd.net
//and kmd.token files within the kmd directory
const kmdtoken = "e4a0aa0518da921bae3f27f40f443a4e154a1c80f25f7759db7767e04d73c06c";
const kmdserver = "http://127.0.0.1";
const kmdport = 7833;

const kmdclient = new algosdk.Kmd(kmdtoken, kmdserver, kmdport);

// Recover a wallet example
(async () => {
    //Get the master get from the backup phrase
    let mn = "section kid alarm inside whisper box despair own wheel polar online undo frequent live clock lab disorder sail toe reform tomato oppose glide absorb scrap";
    let mdk =  (await algosdk.mnemonicToMasterDerivationKey(mn));
    console.log(mdk);
    //Create the wallet using the master derivation key
    let walletid = (await kmdclient.createWallet("RecoveredWalletName2", "", mdk)).wallet.id;;
    console.log(walletid);
    //Get a wallet handle
    let wallethandle = (await kmdclient.initWalletHandle(walletid, "")).wallet_handle_token;
    console.log("Got wallet handle.", wallethandle);
    //Generate 1 address. You could generate multiple accounts
    let address1 = (await kmdclient.generateKey(wallethandle)).address;
    console.log("Created new account.", address1);
    let address2 = (await kmdclient.generateKey(wallethandle)).address;
    console.log("Created new account.", address2);
    let address3 = (await kmdclient.generateKey(wallethandle)).address;
    console.log("Created new account.", address3);
})().catch(e => {
    console.log(e.text);
})