'use strict';

const fetch  = require('node-fetch');
const fs     = require('mz/fs');
const path   = require('path');
const mkdirp = require('./util/mkdirp');

const BASE_URL    = 'https://raw.githubusercontent.com/BYVoid/OpenCC/master/';
const OUTPUT_PATH = path.resolve(__dirname, '../opencc-database');

const FILENAMES = [
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

const DATA_FILENAMES = [
  'HKVariants',
  'HKVariantsPhrases',
  'HKVariantsRevPhrases',
  'JPVariants',
  'STCharacters',
  'STPhrases',
  'TSCharacters',
  'TSPhrases',
  'TWPhrasesIT',
  'TWPhrasesName',
  'TWPhrasesOther',
  'TWVariants',
  'TWVariantsRevPhrases'
];

async function main() {
  await Promise.all(FILENAMES.map(downloadFile));

  const contents = await Promise.all(DATA_FILENAMES.map(filename => {
    return (async () => {
      const text = await fetchText(`${ BASE_URL }data/dictionary/${ filename }.txt`);

      return {
        [filename]: text.split('\n').reduce((array, line) => {
          line && array.push(line.trim().split(/[\s\t]/));

          return array;
        }, [])
      };
    })();
  }));

  const merged = Object.assign.apply(null, contents);

  await fs.writeFile('dist/dictionary.json', JSON.stringify(merged, null, 2));
}

async function fetchText(url) {
  const res        = await fetch(url);
  const { status } = res;

  if (status !== 200) {
    throw new Error(`Server returned ${ status }`);
  }

  return await res.text();
}

async function downloadFile(filename) {
  const text           = await fetchText(BASE_URL + filename);
  const outputFilename = path.join(OUTPUT_PATH, filename);

  await mkdirp(path.dirname(outputFilename));
  await fs.writeFile(outputFilename, text);
}

main();
