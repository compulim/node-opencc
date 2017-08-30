'use strict';

const assert = require('assert');
const fs     = require('mz/fs');
const opencc = require(`../${ require('../package.json').main }`);
const path   = require('path');

describe('Convert based on OpenCC tests', function () {
  it('should convert Hong Kong to Simplified Chinese', async function () {
    await testConvert('hongKongToSimplified', 'hk2s.in', 'hk2s.ans');
  });

  it('should convert Simplified Chinese to Hong Kong', async function () {
    await testConvert('simplifiedToHongKong', 's2hk.in', 's2hk.ans');
  });

  it('should convert Simplified Chinese to Traditional Chinese', async function () {
    await testConvert('simplifiedToTraditional', 's2t.in', 's2t.ans');
  });

  it('should convert Simplified Chinese to Taiwan', async function () {
    await testConvert('simplifiedToTaiwan', 's2tw.in', 's2tw.ans');
  });

  it('should convert Simplified Chinese to Taiwan with phrases', async function () {
    await testConvert('simplifiedToTaiwanWithPhrases', 's2twp.in', 's2twp.ans');
  });

  it('should convert Traditional Chinese to Simplified Chinese', async function () {
    await testConvert('traditionalToSimplified', 't2s.in', 't2s.ans');
  });

  it('should convert Taiwan to Simplified Chinese', async function () {
    await testConvert('taiwanToSimplified', 'tw2s.in', 'tw2s.ans');
  });

  it('should convert Taiwan to Simplified Chinese with phrases', async function () {
    await testConvert('taiwanToSimplifiedWithPhrases', 'tw2sp.in', 'tw2sp.ans');
  });
});

async function readTestFile(filename) {
  return await fs.readFile(path.join(__dirname, '../opencc-database/test/testcases/', filename), 'utf8');
}

async function testConvert(name, inputFile, expectedFile, done) {
  const results = await Promise.all([
    readTestFile(inputFile),
    readTestFile(expectedFile)
  ]);

  const actual = opencc[name](results[0]);

  assert.equal(results[1], actual);
}
