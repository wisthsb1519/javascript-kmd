// export an account that was generated with Knd

const algosdk = require('algosdk');

const kmdtoken = "e4a0aa0518da921bae3f27f40f443a4e154a1c80f25f7759db7767e04d73c06c";
const kmdserver = "http://127.0.0.1";
const kmdport = 7833;
const kmdclient = new algosdk.Kmd(kmdtoken, kmdserver, kmdport);

(async () => {
    var walletid = null;
    let wallets = (await kmdclient.listWallets()).wallets;
    console.log("List Wallet:", wallets);
    wallets.forEach(function (arrayItem) {
        console.log(arrayItem.name);
        if( arrayItem.name === 'RecoveredWalletName2'){
            walletid = arrayItem.id;
        }
    });
    let wallethandle = (await kmdclient.initWalletHandle(walletid, "")).wallet_handle_token;
    // console.log("Got wallet handle.", wallethandle);

    let accounts = (await kmdclient.listKeys(wallethandle));
    console.log("Accounts", accounts);
    console.log(accounts.addr);
    let accountKey = (await kmdclient.exportKey(wallethandle, "", "3I3MGASYS3RPPKKLDHAGGBCGGEWWLNSW5QFJVCPKBKBRU6UVKON6X2UMFM"));
    console.log(accountKey.private_key);
    // let accounts = (await kmdclient.listKeys(wallethandle));
    // console.log("Accounts", accounts);
    // console.log(accounts.addr);
    let mn = (await algosdk.secretKeyToMnemonic(accountKey.private_key));
    console.log(mn);
})().catch(e => {
    console.log(e.text);
})