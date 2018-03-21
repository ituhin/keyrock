let ethWalletLib = require('../lib/eth_wallet.js');

exports.createWallet = function(req, res){
	var account = ethWalletLib.createWallet();
	var success = account.address && account.privateKey ? true : false;

	res.status(200).json({success: success, data: {address: account.address, privateKey: account.privateKey} });
}

exports.getBalance = function(req, res){
	ethWalletLib.getBalance(req.params.address).then(rs => {
		res.status(200).json({success: true, data: {address: rs.address, balance: rs.balance, unit: rs.unit} })
	}, error => {
		res.status(500).json({success: false, error: error})
	})
}

exports.transaction = function(req, res){
	ethWalletLib.transaction({privateKey: req.body.privateKey, destination: req.body.destination, amount: req.body.amount}).then(rs => {
		res.status(200).json({success: true, data: rs})
	}, error => {
		res.status(500).json({success: false, error: error})
	})
}