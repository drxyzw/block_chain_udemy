const ChainUtil = require('../chain-util');
const {DIFFICULTY, MINE_RATE} = require('../config');

class Block {
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        // 'difficulty' is set from previous mining.
        // So, for the first block, we use an initial DIFFICULTY
        this.difficulty = difficulty || DIFFICULTY;
    }
    toString() {
        return `Block -
            Timestamp : ${this.timestamp}
            Last Hash : ${this.lastHash.substring(0, 10)}
            Hash      : ${this.hash.substring(0, 10)}
            Nonce     : ${this.nonce}
            Difficulty: ${this.difficulty}
            Data      : ${this.data}`;
    }

    // to create a first block
    static genesis() {
        return new this('Genesis time', '-----', 'f1r57-h45h', [], 0, DIFFICULTY);
    }

    // to create a subsequent block
    static mineBlock(lastBlock, data) {
        const lashHash = lastBlock.hash;
        let {difficulty} = lastBlock;
        let nonce = 0;
        let hash, timestamp;
        // Proof of Work
        do {
            nonce++;
            timestamp = Date.now(); // millsoc form 1970
            difficulty = Block.adjustDificulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lashHash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty))
        
        return new this(timestamp, lashHash, hash, data, nonce, difficulty);
    }

    static hash(timestamp, lastHash, data, nonce, difficulty) {
        return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block) {
        const {timestamp, lastHash, data, nonce, difficulty} = block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    static adjustDificulty(lastBlock, currentTime) {
        let {difficulty} = lastBlock;
        const targetTimestamp = lastBlock.timestamp + MINE_RATE
        difficulty = (targetTimestamp > currentTime) ? (difficulty+1) : ((targetTimestamp == currentTime) ? difficulty : (difficulty-1));
        return difficulty;
    }
}

module.exports = Block;
