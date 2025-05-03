const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
// list of websocket addresses
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS',
};

// For 1st server
// npm run dev
// For 2nd server
// HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev
// For 3rd server
// HTTP_PORT=3003 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev

class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() { // start server
        const server = new Websocket.Server({port: P2P_PORT})
        server.on('connection', socket => this.connectSocket(socket)); // listening to 'connection' event form peers --> add 'sockets' array
        this.connectToPeers(); //connecting to the master server

        console.log(`Listening for peer-to-peer connection on port: ${P2P_PORT}`)
    }

    connectToPeers() { // connects to master server
        peers.forEach(peer => { // ws:localhost:5002
            const socket = new Websocket(peer);

            socket.on('open', () => this.connectSocket(socket))
        })
    }
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket); // start listening to message

        this.sendChain(socket);
    }

    messageHandler(socket) { // start listening to message
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch(data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;
                default:
                    break;
            }
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransaction() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({ 
            type: MESSAGE_TYPES.clear_transactions 
        })));
    }
}

module.exports = P2pServer;
