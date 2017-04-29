'use strict';

const fs            = require('fs');
const path          = require('path');
const promiseReduce = require('./util/promiseReduce');
const readFile      = require('./util/readFile');

const LOADED_DICTIONARIES = {};

async function getDictionary(name, options) {
  const reverse        = (options || {}).reverse;
  const dictionaryName = name + (reverse ? 'Rev' : '');
  let   dictionary     = LOADED_DICTIONARIES[dictionaryName];

  if (!dictionary) {
    dictionary = LOADED_DICTIONARIES[dictionaryName] = await loadDictionaryFromFile(name, options);
  }

  return dictionary;
}

function convertChain(input, chains) {
  return promiseReduce(
    chains,
    async (input, chain) => {
      const dictionaries = await Promise.all(chain);

      dictionaries.splice(0, 0, {});

      return translate(input, Object.assign.apply(null, dictionaries));
    },
    input
  );
}

exports.hongKongToSimplified = function (text) {
  return convertChain(text, [
    [
      getDictionary('HKVariantsRevPhrases'),
      getDictionary('HKVariants', { reverse: true })
    ],
    [
      getDictionary('TSPhrases'),
      getDictionary('TSCharacters')
    ],
  ]);
};

exports.simplifiedToHongKong = function (text) {
  return convertChain(text, [
    [
      getDictionary('STPhrases'),
      getDictionary('STCharacters')
    ],
    [
      getDictionary('HKVariantsPhrases'),
      getDictionary('HKVariants')
    ]
  ]);
};

exports.simplifiedToTraditional = function (text) {
  return convertChain(text, [
    [
      getDictionary('STPhrases'),
      getDictionary('STCharacters')
    ]
  ]);
};

exports.simplifiedToTaiwan = function (text) {
  return convertChain(text, [
    [
      getDictionary('STPhrases'),
      getDictionary('STCharacters')
    ],
    [
      getDictionary('TWVariants')
    ]
  ]);
};

exports.simplifiedToTaiwanWithPhrases = function (text) {
  return convertChain(text, [
    [
      getDictionary('STPhrases'),
      getDictionary('STCharacters')
    ],
    [
      getDictionary('TWPhrasesIT'),
      getDictionary('TWPhrasesName'),
      getDictionary('TWPhrasesOther'),
      getDictionary('TWVariants')
    ]
  ]);
};

exports.traditionalToHongKong = function (text) {
  return convertChain(text, [
    [
      getDictionary('HKVariants')
    ]
  ]);
};

exports.traditionalToSimplified = function (text) {
  return convertChain(text, [
    [
      getDictionary('TSPhrases'),
      getDictionary('TSCharacters')
    ]
  ]);
};

exports.traditionalToTaiwan = function (text) {
  return convertChain(text, [
    [
      getDictionary('TWVariants')
    ]
  ]);
};

exports.taiwanToSimplified = function (text) {
  return convertChain(text, [
    [
      getDictionary('TWVariantsRevPhrases'),
      getDictionary('TWVariants', { reverse: true })
    ],
    [
      getDictionary('TSPhrases'),
      getDictionary('TSCharacters')
    ]
  ]);
};

exports.taiwanToSimplifiedWithPhrases = function (text) {
  return convertChain(text, [
    [
      getDictionary('TWVariantsRevPhrases'),
      getDictionary('TWVariants', { reverse: true })
    ],
    [
      getDictionary('TWPhrasesIT', { reverse: true }),
      getDictionary('TWPhrasesName', { reverse: true }),
      getDictionary('TWPhrasesOther', { reverse: true })
    ],
    [
      getDictionary('TSPhrases'),
      getDictionary('TSCharacters')
    ]
  ]);
};

function translate(text, dictionary) {
  const maxLength  = Object.keys(dictionary).reduce((maxLength, word) => Math.max(maxLength, word.length), 0);
  const translated = [];

  for (let i = 0, { length } = text; i < length; i++) {
    let found;

    for (let j = maxLength; j > 0; j--) {
      const target = text.substr(i, j);
      const dest   = dictionary[target];

      if (dest) {
        i += j - 1;
        translated.push(dest);
        found = 1;
        break;
      }
    }

    !found && translated.push(text[i]);
  }

  return translated.join('');
}

async function loadDictionaryFromFile(name, options = {}) {
  const { reverse } = options;
  const text        = await readFile(path.join(__dirname, '../opencc-database/data/dictionary/', `${ name }.txt`), 'utf8');
  const lines       = text.split('\n').map(line => line.trim());

  return lines.reduce((map, line) => {
    if (line) {
      const tokens = line.split('\t').slice(0, 2);

      tokens[1] = tokens[1].split(' ')[0];

      reverse && tokens.reverse();
      map[tokens[0]] = tokens[1];
    }

    return map;
  }, {});
}
