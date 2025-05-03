const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        //gran valid transactions from pool
        const validTransactions = this.transactionPool.validTransactions();
        // include a reward for the miner
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()))
        // create a block ocnsisting of the valid transactions including reward transaction
        const block = this.blockchain.addBlock(validTransactions);
        // synchronize the chains in the p2p server
        this.p2pServer.syncChains();
        // clear the local transaction pool
        this.transactionPool.clear();
        // broadcast to every miner to clear their transactions pools
        this.p2pServer.broadcastClearTransaction();

        return block;
    }
}

module.exports = Miner;
