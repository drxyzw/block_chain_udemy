const Transaction = require("./transaction");

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);

        if (transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    existingTransaction(senderAddress) {
        return this.transactions.find(t => t.input.address === senderAddress);
    }

    validTransactions() {
        // conditions for validity
        // 1. total outputs amount == the original balance
        // 2. transactions are not corrupted
        return this.transactions.filter(transaction => {
            // 1. total outputs amount == the original balance
            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount;
            }, 0);

            if(transaction.input.amount !== outputTotal) {
                console.log(`Invalid transaction from ${transaction.input.address}.`);
                return;
            }

            // 2. transactions are not corrupted
            if(!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}.`);
                return;
            }

            return transaction;
        });
    }

    clear() {
        this.transactions = [];
    }
    
}

module.exports = TransactionPool;
