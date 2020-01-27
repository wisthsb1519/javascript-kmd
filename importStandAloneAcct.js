// import a standalone account that was generated with algod into a kmd wallet

const algosdk = require('algosdk');

const kmdtoken = "e4a0aa0518da921bae3f27f40f443a4e154a1c80f25f7759db7767e04d73c06c";
const kmdserver = "http://127.0.0.1";
const kmdport = 7833;
const kmdclient = new algosdk.Kmd(kmdtoken, kmdserver, kmdport);

(async () => {
    var walletid = null;
    let wallets = (await kmdclient.listWallets()).wallets;
    console.log("List Wallet.", wallets);
    wallets.forEach(function (arrayItem) {
        console.log(arrayItem.name);
        if( arrayItem.name === 'RecoveredWalletName2'){
            walletid = arrayItem.id;
        }
    });
    let wallethandle = (await kmdclient.initWalletHandle(walletid, "")).wallet_handle_token;
    
    let account = algosdk.generateAccount();
    console.log(account.addr, account.sk);
    let mn = algosdk.secretKeyToMnemonic(account.sk);
    console.log(mn);
    let importedAccount = (await kmdclient.importKey(wallethandle, account.sk));
    console.log(importedAccount);
})().catch(e => {
    console.log(e.text);
})