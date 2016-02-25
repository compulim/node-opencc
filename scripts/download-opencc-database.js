'use strict';

const
  fetch = require('node-fetch'),
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird');

const
  mkdirp = Promise.promisify(require('mkdirp')),
  writeFile = Promise.promisify(fs.writeFile);

const
  BASE_URL = 'https://raw.githubusercontent.com/BYVoid/OpenCC/master/',
  OUTPUT_PATH = path.resolve(module.filename, '../../opencc-database'),
  URLS = [
    'data/config/hk2s.json',
    'data/config/hk2s.json',
    'data/config/s2hk.json',
    'data/config/s2t.json',
    'data/config/s2tw.json',
    'data/config/s2twp.json',
    'data/config/t2hk.json',
    'data/config/t2s.json',
    'data/config/t2tw.json',
    'data/config/tw2s.json',
    'data/config/tw2sp.json',
    'data/dictionary/HKVariants.txt',
    'data/dictionary/HKVariantsPhrases.txt',
    'data/dictionary/HKVariantsRevPhrases.txt',
    'data/dictionary/JPVariants.txt',
    'data/dictionary/STCharacters.txt',
    'data/dictionary/STPhrases.txt',
    'data/dictionary/TSCharacters.txt',
    'data/dictionary/TSPhrases.txt',
    'data/dictionary/TWPhrasesIT.txt',
    'data/dictionary/TWPhrasesName.txt',
    'data/dictionary/TWPhrasesOther.txt',
    'data/dictionary/TWVariants.txt',
    'data/dictionary/TWVariantsRevPhrases.txt',
    'test/testcases/hk2s.ans',
    'test/testcases/hk2s.in',
    'test/testcases/s2hk.ans',
    'test/testcases/s2hk.in',
    'test/testcases/s2t.ans',
    'test/testcases/s2t.in',
    'test/testcases/s2tw.ans',
    'test/testcases/s2tw.in',
    'test/testcases/s2twp.ans',
    'test/testcases/s2twp.in',
    'test/testcases/t2s.ans',
    'test/testcases/t2s.in',
    'test/testcases/tw2s.ans',
    'test/testcases/tw2s.in',
    'test/testcases/tw2sp.ans',
    'test/testcases/tw2sp.in'
  ];

Promise.all(URLS.map(url =>
  fetch(BASE_URL + url)
    .then(res => {
      const status = res.status;

      if (status === 200) {
        return res.text();
      } else {
        throw new Error(`Server returned ${status}`);
      }
    })
    .then(text => {
      const filename = path.resolve(OUTPUT_PATH, url);

      return mkdirp(path.dirname(filename))
        .then(() => writeFile(filename, text))
    })
)).catch(err => {
  console.error(err);
  process.exit(-1);
});
