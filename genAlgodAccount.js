const algosdk = require('algosdk');

// purestake API info

// const token = {
//     'X-API-Key': '99lFzYQJD07ygYi1x48Zd74VrfcIFUic9uq91ese'
// }
// const server = "https://testnet-algorand.api.purestake.io/ps1";
// const port = "";

// const token  = "a967f42b017cd4c5c95a633e87b5ff14226ae60609e174bf5832722631946e13";
// const server = "127.0.0.1";
// const port = 8080;

// let algodclient = new algosdk.Algod(token, server, port);
//submit the transaction

var account = algosdk.generateAccount();
console.log(account.addr, account.sk);