import * as assert from 'assert';
import { beforeEach, describe, it } from 'mocha';
import { BlockGold as Block, networks } from '..';

import * as fixtures from './fixtures/block_gold.json';

const networkMap: { [net: string]: networks.Network } = {
  bitcoingold: networks.bitcoingold,
  bitcoingoldregtest: networks.bitcoingoldregtest,
};

describe('BlockGold', () => {
  describe('fromBuffer/fromHex', () => {
    fixtures.valid.forEach(f => {
      it('imports ' + f.description, () => {
        const block = Block.fromHex(f.hex);

        assert.strictEqual(block.version, f.version);
        assert.strictEqual(block.prevHash!.toString('hex'), f.prevHash);
        assert.strictEqual(block.merkleRoot!.toString('hex'), f.merkleRoot);
        // if (block.witnessCommit) {
        //   assert.strictEqual(
        //     block.witnessCommit.toString('hex'),
        //     f.witnessCommit,
        //   );
        // }
        assert.strictEqual(block.height, f.height);
        assert.strictEqual(block.timestamp, f.timestamp);
        assert.strictEqual(block.bits, f.bits);
        assert.strictEqual(block.nonce!.toString('hex'), f.nonce);
        assert.strictEqual(block.solution!.toString('hex'), f.solution);
        assert.strictEqual(
          block.transactions ? block.transactions.length : 0,
          f.tx ? f.tx.length : 0,
        );
        // if (f.size && f.strippedSize && f.weight) {
        //   assert.strictEqual(block.byteLength(false, true), f.size);
        //   assert.strictEqual(block.byteLength(false, false), f.strippedSize);
        //   assert.strictEqual(block.weight(), f.weight);
        // }
      });
    });

    fixtures.invalid.forEach(f => {
      it('throws on ' + f.exception, () => {
        assert.throws(() => {
          Block.fromHex(f.hex);
        }, new RegExp(f.exception));
      });
    });
  });

  describe('toBuffer/toHex', () => {
    fixtures.valid.forEach(f => {
      let block: Block;

      beforeEach(() => {
        block = Block.fromHex(f.hex);
      });

      it('exports ' + f.description, () => {
        const size = block.byteLength(true);
        assert.strictEqual(block.toHex(true), f.hex.slice(0, size * 2));
        assert.strictEqual(block.toHex(), f.hex);
      });
    });
  });

  describe('getHash/getId', () => {
    fixtures.valid.forEach(f => {
      let block: Block;

      beforeEach(() => {
        block = Block.fromHex(f.hex);
      });

      it('returns ' + f.id + ' for ' + f.description, () => {
        const network = networkMap[f.network];
        assert.strictEqual(block.getHash(network).toString('hex'), f.hash);
        assert.strictEqual(block.getId(network), f.id);
      });
    });
  });

  describe('getUTCDate', () => {
    fixtures.valid.forEach(f => {
      let block: Block;

      beforeEach(() => {
        block = Block.fromHex(f.hex);
      });

      it('returns UTC date of ' + f.id, () => {
        const utcDate = block.getUTCDate().getTime();

        assert.strictEqual(utcDate, f.timestamp * 1e3);
      });
    });
  });

  describe('calculateMerkleRoot', () => {
    it('should throw on zero-length transaction array', () => {
      assert.throws(() => {
        Block.calculateMerkleRoot([]);
      }, /Cannot compute merkle root for zero transactions/);
    });

    fixtures.valid.forEach(f => {
      if (!f.tx) return;

      let block: Block;

      beforeEach(() => {
        block = Block.fromHex(f.hex);
      });

      it('returns ' + f.merkleRoot + ' for ' + f.id, () => {
        assert.strictEqual(
          Block.calculateMerkleRoot(block.transactions!).toString('hex'),
          f.merkleRoot,
        );
      });

      // if (f.witnessCommit) {
      //   it('returns witness commit ' + f.witnessCommit + ' for ' + f.id, () => {
      //     assert.strictEqual(
      //       Block.calculateMerkleRoot(block.transactions!, true).toString(
      //         'hex',
      //       ),
      //       f.witnessCommit,
      //     );
      //   });
      // }
    });
  });

  describe('checkTxRoots', () => {
    fixtures.valid.forEach(f => {
      if (!f.tx) return;

      let block: Block;

      beforeEach(() => {
        block = Block.fromHex(f.hex);
      });

      it('returns ' + f.valid + ' for ' + f.id, () => {
        assert.strictEqual(block.checkTxRoots(), true);
      });
    });
  });

  describe('checkProofOfWork', () => {
    fixtures.valid
      .filter(f => f.network === 'bitcoingold')
      .forEach(f => {
        let block: Block;

        beforeEach(() => {
          block = Block.fromHex(f.hex);
        });

        it('returns ' + f.valid + ' for ' + f.id, () => {
          assert.strictEqual(
            block.checkProofOfWork(true, networkMap[f.network]),
            f.valid,
          );
        });
      });
  });
});
