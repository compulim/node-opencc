'use strict';

const
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird');

const
  readFile = Promise.promisify(fs.readFile);

const databases = exports.databases = {};

function getDatabase(name, options) {
  const
    reverse = (options || {}).reverse,
    database = databases[name + reverse ? 'Rev' : ''];

  return database || loadDatabase(name + '.txt', options);
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
      getDatabase('HKVariantsRevPhrases'),
      getDatabase('HKVariants', { reverse: true })
    ],
    [
      getDatabase('TSPhrases'),
      getDatabase('TSCharacters')
    ],
  ]);
};

exports.simplifiedToHongKong = function (text) {
  return convertChain(text, [
    [
      getDatabase('STPhrases'),
      getDatabase('STCharacters')
    ],
    [
      getDatabase('HKVariantsPhrases'),
      getDatabase('HKVariants')
    ]
  ]);
};

exports.simplifiedToTraditional = function (text) {
  return convertChain(text, [
    [
      getDatabase('STPhrases'),
      getDatabase('STCharacters')
    ]
  ]);
};

exports.simplifiedToTaiwan = function (text) {
  return convertChain(text, [
    [
      getDatabase('STPhrases'),
      getDatabase('STCharacters')
    ],
    [
      getDatabase('TWVariants')
    ]
  ]);
};

exports.simplifiedToTaiwanWithPhrases = function (text) {
  return convertChain(text, [
    [
      getDatabase('STPhrases'),
      getDatabase('STCharacters')
    ],
    [
      getDatabase('TWPhrases'),
      getDatabase('TWVariants')
    ]
  ]);
};

exports.traditionalToHongKong = function (text) {
  return convertChain(text, [
    [
      getDatabase('HKVariants')
    ]
  ]);
};

exports.traditionalToSimplified = function (text) {
  return convertChain(text, [
    [
      getDatabase('TSPhrases'),
      getDatabase('TSCharacters')
    ]
  ]);
};

exports.traditionalToTaiwan = function (text) {
  return convertChain(text, [
    [
      getDatabase('TWVariants')
    ]
  ]);
};

exports.taiwanToSimplified = function (text) {
  return convertChain(text, [
    [
      getDatabase('TWVariantsRevPhrases'),
      getDatabase('TWVariants', { reverse: true })
    ],
    [
      getDatabase('TSPhrases'),
      getDatabase('TSCharacters')
    ]
  ]);
};

exports.taiwanToSimplifiedWithPhrases = function (text) {
  return convertChain(text, [
    [
      getDatabase('TWVariantsRevPhrases'),
      getDatabase('TWVariants', { reverse: true })
    ],
    [
      getDatabase('TWPhrases', { reverse: true })
    ],
    [
      getDatabase('TSPhrases'),
      getDatabase('TSCharacters')
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
        i += dest.length - 1;
        converted.push(dest);
        found = 1;
        break;
      }
    }

    !found && converted.push(text[i]);
  }

  return converted.join('');
}

function loadDatabase(filename, options) {
  const reverse = (options || {}).reverse;

  return (
    readFile(path.resolve(module.filename, '../../opencc-database/data/dictionary/', filename), 'utf8')
      .then(text => text.split('\n').reduce((map, line) => {
        if (line) {
          const tokens = line.split('\t');

          reverse && tokens.reverse();
          map[tokens[0]] = tokens[1];
        }

        return map;
      }, {}))
  );
}