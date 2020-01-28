const algosdk = require('algosdk');

//Retrieve the token, server and port values for your installation in the kmd.net
//and kmd.token files within the kmd directory
const kmdtoken = "e4a0aa0518da921bae3f27f40f443a4e154a1c80f25f7759db7767e04d73c06c";
const kmdserver = "http://127.0.0.1";
const kmdport = 7833;

const kmdclient = new algosdk.Kmd(kmdtoken, kmdserver, kmdport);

// Recover a wallet example
(async () => {
    var walletid = null;
    let wallets = (await kmdclient.listWallets()).wallets;
    // console.log("List Wallet.", wallets);
    wallets.forEach(function (arrayItem) {
        // console.log(arrayItem.name);
        if( arrayItem.name === 'RecoveredWalletName2'){
            walletid = arrayItem.id;
        }
    });
    let wallethandle = (await kmdclient.initWalletHandle(walletid, "")).wallet_handle_token;
    
    let account1 = algosdk.generateAccount();
    console.log(account1.addr, account1.sk);
    let account2 = algosdk.generateAccount();
    console.log(account2.addr, account2.sk);

    const mparams = {
        version: 1,
        threshold: 2,
        // addrs: [account1.addr, account2.addr],
        addrs: [account1.publicKey, account2.publicKey],
    };

    let msig_addresses = [account1.addr, account2.addr];
    var multsigaddr = algosdk.multisigAddress(mparams);
    console.log("Here is my KMD multisig account: " + multsigaddr);

    try {
        let importedMultisig = await kmdclient.importMultisig(wallethandle, 1, 2, msig_addresses);
        // let importedMultisig = await kmdclient.importMultisig(wallethandle, mparams);
        console.log("Imported Multisig Account:", importedMultisig);
    } catch(error) {
        console.error(error);
    }

    // let accounts = kmdclient.listKeys();
    // console.log("List of KMD Accounts: ", accounts);
    // let msigAccounts = kmdclient.listMultisig();
    // console.log("List of KMD Multsig Accounts: ", msigAccounts);

})().catch(e => {
    console.log(e.text);
})