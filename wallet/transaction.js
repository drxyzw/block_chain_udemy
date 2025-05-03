const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, recipient, amount) { // adding a subsequent transaction for the same sender
        const senderOutput = this.outputs.find(output =>output.address === senderWallet.publicKey); // remaining balance

        if (amount > senderOutput.amount) {
            console.log(`Amount ${amount} exceeds balance`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({ amount, address: recipient });
        Transaction.signTransaction(this, senderWallet);

        return this;
    }

    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    static newTransaction(senderWallet, recipient, amount) {
        if (amount > senderWallet.balance) {
            console.log(`Amount: ${amount} exceeds balance.`)
            return;
        }

        return Transaction.transactionWithOutputs(senderWallet,  [
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey},
            { amount, address: recipient}  // if key name and value name are the same, we can omit the key name
        ]);
    }

    static rewardTransaction(
        minerWallet, 
        blockchainWallet // senderWallet to sign the transction
    ) {
        return Transaction.transactionWithOutputs(blockchainWallet, [
            { amount: MINING_REWARD, address: minerWallet.publicKey 
                }
        ]);
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
