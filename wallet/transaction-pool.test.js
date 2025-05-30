const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('.');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
    let tp, wallet, transaction;

    beforeEach(() => {
        tp = new TransactionPool();
        wallet = new Wallet();
        bc = new Blockchain();
        transaction = wallet.createTransaction('r4nd-4ddr355', 30, bc, tp);
    });

    it('adds a transaction to the pool', () => {
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
    });

    it('updates a transaction in the pool', () => {
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'foo-Addr355', 40);
        tp.updateOrAddTransaction(newTransaction);

        expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
        .not.toEqual(oldTransaction);
    });

    it('clears transactions', () => {
        tp.clear();
        expect(tp.transactions).toEqual([]);
    })

    describe("mixing valid and corrupt transactions", () => {
        let validTransactions;

        beforeEach(() => {
            validTransactions = [...tp.transactions];
            for(let i=0; i<6; i++) {
                wallet = new Wallet();
                transaction = wallet.createTransaction('r4nd-4ddr355', 30, bc, tp);
                // for even number, manipulate transaction
                if(i % 2 === 0) {
                    transaction.input.amount = 99999;
                } else {
                // for odd number, add transaction to valid transactions array
                    validTransactions.push(transaction);
                }
            }
        });

        it('shows a difference between valid and invalid transactions', () => {
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
        });

        it('grabs valid transactions', () => {
            expect(tp.validTransactions()).toEqual(validTransactions);
        });
    });
})