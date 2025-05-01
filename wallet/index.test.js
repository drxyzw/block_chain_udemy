const Wallet = require('.');
const TransacitonPool = require('./transaction-pool');

describe('Wallet', () => {
    let wallet, tp;

    beforeEach(() => {
        wallet = new Wallet();
        tp = new TransacitonPool();
    });

    describe('creation of a transaction', () => {
        let transaction, sendAmount, recepient;

        beforeEach(() => {
            sendAmount = 50;
            recepient = 'r4ndom-4ddr355';
            transaction = wallet.createTransaction(recepient, sendAmount, tp);
        });

        describe('and doing the same transaction', () => {
            beforeEach(() => {
                wallet.createTransaction(recepient, sendAmount, tp);
            });

            it('doubles the `sendAmount` subtracted form the wallet balance', () => {
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                    .toEqual(wallet.balance - sendAmount * 2); // sender's remaining amount is deducted twice
            });

            it('clones the `sendAmount` output for the recepient', () => {
                expect(transaction.outputs.filter(output => output.address === recepient)
                    .map(output => output.amount)).toEqual([sendAmount, sendAmount]);
            });
        });
    });
});