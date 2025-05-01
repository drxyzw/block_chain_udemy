const ChainUtil = require('../chain-util');

class Transaction {
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, recepient, amount) { // adding a subsequent transaction for the same sender
        const senderOutput = this.outputs.find(output =>output.address === senderWallet.publicKey); // remaining balance

        if (amount > senderOutput.amount) {
            console.log(`Amount ${amount} exceeds balance`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({ amount, address: recepient });
        Transaction.signTransaction(this, senderWallet);

        return this;
    }

    static newTransaction(senderWallet, recepient, amount) {
        const transaction = new this();
        
        if (amount > senderWallet.balance) {
            console.log(`Amount: ${amount} exceeds balance.`)
            return;
        }

        transaction.outputs.push(...[
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey},
            { amount, address: recepient} // if key name and value name are the same, we can omit the key name
        ]);
        Transaction.signTransaction(transaction, senderWallet);

        return transaction;
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance, // for input, put balance amount of sender before transaction
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(
            transaction.input.address, // = public key of sender
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        );
    }
}

module.exports = Transaction;
