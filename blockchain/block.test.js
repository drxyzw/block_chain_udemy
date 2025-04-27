const Block = require('./block');

describe('Block', () => {
    let data, lastBlock, block;

    beforeEach(() => {
        data = 'bar';
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock, data);
    });

    it('sets the `data` to match the input', () => {
        expect(block.data).toEqual(data);
    });

    it('sets the `lastHash` to match the hash of the last block', () => {
        expect(block.lastHash).toEqual(lastBlock.hash);
    });

    it('generates a hash that matches th difficulty', () => {
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
        console.log(block.toString())
    })

    it('lowers the difficulty for slowly minied blocks', () => {
        // simulate a case where current time is last timestamp + 1hr, ie: taking too much time
        expect(Block.adjustDificulty(block, block.timestamp + 60*60*1000)).toEqual(block.difficulty-1);
    })

    it('raises the difficulty for quickly minied blocks', () => {
        // simulate a case where current time is last timestamp + 1 millsec, ie: taking too short time
        expect(Block.adjustDificulty(block, block.timestamp + 1)).toEqual(block.difficulty+1);
    })
});
