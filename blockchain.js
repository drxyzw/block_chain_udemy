const Block = require('./block');

class Blockchain{
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock(data) {
        const block = Block.mineBlock(this.chain[this.chain.length-1], data);
        this.chain.push(block);
        return block;
    }

    isValidChain(chain) { // chain = incoming chain
        // need to convert to string and compare because JS retunrs not equal
        // if the context is the same but coming from different object
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for (let i=1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i-1];

            if (block.lastHash !== lastBlock.hash || // consistency of last hash
                block.hash !== Block.blockHash(block)) {
                return false;
            }
        }
        return true;
    }

    replaceChain(newChain) {;
        // shorter chain cannot replace
        if(newChain.length <= this.chain.length) {
            console.log('Received chain is not longer thant eh curremt chain.');
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log('Recieved chain is not valida.');
            return;
        }

        console.log('Replacing blockchain with the new chain')
        this.chain = newChain;
    }
}

module.exports = Blockchain;
