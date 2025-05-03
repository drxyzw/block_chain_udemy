const Wallet = require('.');
const TransacitonPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const { INITIAL_BALANCE } = require('../config');

describe('Wallet', () => {
    let wallet, tp;

    beforeEach(() => {
        wallet = new Wallet();
        tp = new TransacitonPool();
        bc = new Blockchain();
    });

    describe('creation of a transaction', () => {
        let transaction, sendAmount, recipient;

        beforeEach(() => {
            sendAmount = 50;
            recipient = 'r4ndom-4ddr355';
            transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
        });

        describe('and doing the same transaction', () => {
            beforeEach(() => {
                wallet.createTransaction(recipient, sendAmount, bc, tp);
            });

            it('doubles the `sendAmount` subtracted form the wallet balance', () => {
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                    .toEqual(wallet.balance - sendAmount * 2); // sender's remaining amount is deducted twice
            });

            it('clones the `sendAmount` output for the recipient', () => {
                expect(transaction.outputs.filter(output => output.address === recipient)
                    .map(output => output.amount)).toEqual([sendAmount, sendAmount]);
            });
        });
    });

    describe('calculating a balance', () => {
        let addBalance, repeatAdd, senderWallet;

        beforeEach(() => {
            senderWallet = new Wallet();
            addBalance = 100;
            repeatAdd = 3;
            for(let i = 0; i < repeatAdd; i++) {
                // send senderWallet to "wallet"'s address (publicKey)
                senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
            }
            // console.log('after loop of adding balance');
            // console.log(tp);
            // console.log("senderWallet")
            // console.log(senderWallet.publicKey)
            // console.log("reripientWallet")
            // console.log(wallet.publicKey)
            // console.log("# of transactions")
            // console.log(tp.transactions)
            // tp.transactions.forEach(t => t.outputs.forEach(o => console.log(o)));
            bc.addBlock(tp.transactions);
        });

        it('calculates the balance for blockchain transactions matching the recipient', () => {
            expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + addBalance * repeatAdd);
        });

        it('calculate the balance for blockchain transactions matching the sender', () => {
            expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - addBalance * repeatAdd);
        });

        describe('and the recipient conducts a transaction', () => {
            let subtractBalance, recipientBalance;

            beforeEach(() => {
                tp.clear();
                subtractBalance = 60;
                recipientBalance = wallet.calculateBalance(bc);
                wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp);
                bc.addBlock(tp.transactions);
            });

            // console.log('before beforeEach of recipient transaction');
            // console.log(tp);
            describe('and the sender sends another transaction to the recipient', () => {
                beforeEach(() => {
                    tp.clear();
                    senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
                    bc.addBlock(tp.transactions);
                });

                it('calculate the recipient balance only using transaction snce its most recent one', () => {
                    expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);
                });
            });

        });
    });
});