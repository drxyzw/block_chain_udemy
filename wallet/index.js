const ChainUtil = require('../chain-util');
const Transaction = require('./transaction')
const { INITIAL_BALANCE } = require('../config');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');

    }

    toString() {
        return `Wallet - 
            publicKey: ${this.publicKey.toString()}
            balance  : ${this.balance}`
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recepient, amount, transactionPool) {
        if (amount > this.balance) {
            console.log(`Amount ${amount} exceeds current balance ${this.balance}`);
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey); // publicKey is sender's address

        if (transaction) { // if the same sender exists in pool, then update the existing transaction
            transaction.update(this, recepient, amount);
        } else { // add a new transaction
            transaction = Transaction.newTransaction(this, recepient, amount);
        }
        transactionPool.updateOrAddTransaction(transaction);
        return transaction;
    }
}

module.exports = Wallet;
