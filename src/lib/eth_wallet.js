import config from '../config.json';
require('dotenv').config();

let Web3 = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider( config.ethNode + process.env.ETHERSCAN_API_KEY ));

console.log(config.ethNode + process.env.ETHERSCAN_API_KEY)

module.exports = {};

module.exports.createWallet = function(){
	var account = web3.eth.accounts.create();
	// if we need to store the new address in db, we can do it here
	return account;
}

module.exports.getBalance = function(address){
	return new Promise(function (resolve, reject){
		if(!address || !web3.utils.isAddress(address)) 
			return reject({address: address, code: 'INVALID_ADDRESS'})

		web3.eth.getBalance(address, function(error, result){
			if(!error){
				resolve({address: address, balance: web3.utils.fromWei(result, 'ether'), unit: 'ether'})
			} else {
				console.log('getBalance-error: ', error.message); 
				reject({code: 'ETH_GET_BALANCE_ERROR', message: error.message})
			}
		})
	})
}


/*
params : {
	privateKey, destination, amount    
}
*/
module.exports.transaction = function(params){ 
	return new Promise(function (resolve, reject){
		if(!params.privateKey || !params.amount || !params.destination || !(params.amount > 0) || !web3.utils.isAddress(params.destination))
			return reject({code: 'INVALID_TRANSACTION_PARAMS'})

		try {
			var account = web3.eth.accounts.privateKeyToAccount(params.privateKey); 
		} catch(e) {
			return reject({code: 'ETH_ACCOUNT_PRIVATE_KEY_ERROR', message: e.message})
		}

		params.privateKey = null; // no longer needed - just a precaution

		if(account)
		account.signTransaction({
			to: params.destination,
			value: web3.utils.toWei(params.amount, 'ether'), 
			gas: 2000000
		}).then(function(rs){
			web3.eth.sendSignedTransaction(rs.rawTransaction)
				.once('transactionHash', function(hash){ resolve({transactionHash: hash}) })
				.once('receipt', function(receipt){ console.log('receipt: ', receipt) })
				.on('error', function(error){ 
					console.log('sendSignedTransaction-error: ', error.message); 
					reject({code: 'ETH_TRANSACTION_ERROR', message: error.message}) 
				})
		}, function(error){
			reject({code: 'ETH_SIGN_TRANSACTION_ERROR', message: error.message}) // shouldnt happen
		})
	})
}

