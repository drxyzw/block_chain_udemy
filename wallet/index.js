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

    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain);

        if (amount > this.balance) {
            console.log(`Amount ${amount} exceeds current balance ${this.balance}`);
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey); // publicKey is sender's address

        if (transaction) { // if the same sender exists in pool, then update the existing transaction
            transaction.update(this, recipient, amount);
        } else { // add a new transaction
            transaction = Transaction.newTransaction(this, recipient, amount);
        }
        transactionPool.updateOrAddTransaction(transaction);
        return transaction;
    }

    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];
        
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            // console.log("inside blockchain loop in calculateBalance");
            // console.log(transaction);
            transactions.push(transaction);
        }));

        // first, find out transaction where input is this wallet.
        // this is the starting point
        // console.log(this.publicKey)
        // console.log(transactions)
        // transactions.forEach(t => t.outputs.forEach(o => console.log(o)))
        const walletInputTs = transactions
            .filter(transaction => transaction.input.address === this.publicKey);
        let startTime = 0;
        // console.log(walletInputTs.length)

        if (walletInputTs.length > 0) {
            const recentInputT = walletInputTs.reduce(
                (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
            );

            balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
            startTime = recentInputT.input.timestamp;
        }

        // console.log("after filter")
        // console.log(transactions.length)
        // console.log(balance)
        // summing up transactions coming in to this wallet, after startTime
        transactions.forEach(transaction => {
            // console.log('entered loop of transaction')
            if (transaction.input.timestamp > startTime) {
                transaction.outputs.find(output => {
                    // console.log('entered loop of output')
                    if (output.address === this.publicKey) {
                        balance += output.amount;
                        // console.log(balance)
                    }
                });
            }
        });

        return balance;
    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = "blockchain-wallet";
        return blockchainWallet;
    }
}

module.exports = Wallet;
