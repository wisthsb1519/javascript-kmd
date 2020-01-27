const algosdk = require('algosdk');

//Retrieve the token, server and port values for your installation in the kmd.net
//and kmd.token files within the kmd directory
const kmdtoken = "e4a0aa0518da921bae3f27f40f443a4e154a1c80f25f7759db7767e04d73c06c";
const kmdserver = "http://127.0.0.1";
const kmdport = 7833;

const kmdclient = new algosdk.Kmd(kmdtoken, kmdserver, kmdport);


var walletid = null;
var wallethandle = null;


(async () => {
    let walletid = (await kmdclient.createWallet("MyTestWallet3", "testpassword", "", "sqlite")).wallet.id;
    console.log("Created wallet.", walletid);

    let wallethandle = (await kmdclient.initWalletHandle(walletid, "testpassword")).wallet_handle_token;
    console.log("Got wallet handle.", wallethandle);

    let address1 = (await kmdclient.generateKey(wallethandle)).address;
    console.log("Created new account1.", address1);
    let address2 = (await kmdclient.generateKey(wallethandle)).address;
    console.log("Created new account2.", address2);
    let address3 = (await kmdclient.generateKey(wallethandle)).address;
    console.log("Created new account2.", address3);
})().catch(e => {
    console.log(e);
});
