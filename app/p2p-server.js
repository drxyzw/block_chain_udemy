const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
// list of websocket addresses
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
// For 1st server
// npm run dev
// For 2nd server
// HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev
// For 3rd server
// HTTP_PORT=3003 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev

class P2pServer {
    constructor(blockchain) {
        this.blockchain = blockchain
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
            // console.log('data', data)
            this.blockchain.replaceChain(data)
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify(this.blockchain.chain));
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }
}

module.exports = P2pServer;
