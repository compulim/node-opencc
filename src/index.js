'use strict';

const
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird');

const
  readFile = Promise.promisify(fs.readFile);

const loadedDictionaries = {};

function getDictionary(name, options) {
  const
    reverse = (options || {}).reverse,
    dictionaryName = name + (reverse ? 'Rev' : ''),
    dictionary = loadedDictionaries[dictionaryName];

  return dictionary || loadDictionary(name + '.txt', options).then(dictionary => {
    loadedDictionaries[dictionaryName] = dictionary;

    return dictionary;
  });
}

function convertChain(input, chains) {
  return Promise.reduce(
    chains,
    (input, chain) => Promise.all(chain).then(dictionaries => {
      dictionaries.splice(0, 0, {});
      return convert(input, Object.assign.apply(null, dictionaries));
    }),
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

function convert(text, dictionary) {
  const
    maxLength = Object.keys(dictionary).reduce((maxLength, word) => Math.max(maxLength, word.length), 0),
    converted = [];

  for (let i = 0; i < text.length; i++) {
    let found;

    for (let j = maxLength; j > 0; j--) {
      const
        target = text.substr(i, j),
        dest = dictionary[target];

      if (dest) {
        i += j - 1;
        converted.push(dest);
        found = 1;
        break;
      }
    }

    !found && converted.push(text[i]);
  }

  return converted.join('');
}

function loadDictionary(filename, options) {
  const reverse = (options || {}).reverse;

  return (
    readFile(path.resolve(module.filename, '../../opencc-database/data/dictionary/', filename), 'utf8')
      .then(text => text.split('\n').reduce((map, line) => {
        if (line) {
          const tokens = line.split('\t').slice(0, 2);

          tokens[1] = tokens[1].split(' ')[0];

          reverse && tokens.reverse();
          map[tokens[0]] = tokens[1];
        }

        return map;
      }, {}))
  );
}