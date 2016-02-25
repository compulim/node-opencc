'use strict';

const
  assert = require('assert'),
  fs = require('fs'),
  opencc = require('../src/index'),
  path = require('path'),
  Promise = require('bluebird');

const
  readFile = Promise.promisify(fs.readFile);

describe('Convert based on OpenCC tests', function () {
  it('should convert Hong Kong to Simplified Chinese', function (done) {
    testConvert('hongKongToSimplified', 'hk2s.in', 'hk2s.ans', done);
  });

  it('should convert Simplified Chinese to Hong Kong', function (done) {
    testConvert('simplifiedToHongKong', 's2hk.in', 's2hk.ans', done);
  });

  it('should convert Simplified Chinese to Traditional Chinese', function (done) {
    testConvert('simplifiedToTraditional', 's2t.in', 's2t.ans', done);
  });

  it('should convert Simplified Chinese to Taiwan', function (done) {
    testConvert('simplifiedToTaiwan', 's2tw.in', 's2tw.ans', done);
  });

  it('should convert Simplified Chinese to Taiwan with phrases', function (done) {
    testConvert('simplifiedToTaiwanWithPhrases', 's2twp.in', 's2twp.ans', done);
  });

  it('should convert Traditional Chinese to Simplified Chinese', function (done) {
    testConvert('traditionalToSimplified', 't2s.in', 't2s.ans', done);
  });

  it('should convert Taiwan to Simplified Chinese', function (done) {
    testConvert('taiwanToSimplified', 'tw2s.in', 'tw2s.ans', done);
  });

  it('should convert Taiwan to Simplified Chinese with phrases', function (done) {
    testConvert('taiwanToSimplifiedWithPhrases', 'tw2sp.in', 'tw2sp.ans', done);
  });
});

function readTestFile(filename) {
  return readFile(path.resolve(module.filename, '../../opencc-database/test/testcases/', filename), 'utf8');
}

function testConvert(name, inputFile, expectedFile, done) {
  return Promise.all([
    readTestFile(inputFile),
    readTestFile(expectedFile)
  ]).then(results =>
    opencc[name](results[0])
      .then(actual => assert.equal(results[1], actual))
  ).then(() => done(), err => done(err));
}
