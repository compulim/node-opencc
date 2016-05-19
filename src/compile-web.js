'use strict';

const
  fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird'),
  UglifyJS = require('uglify-js');

const
  readFile = Promise.promisify(fs.readFile),
  writeFile = Promise.promisify(fs.writeFile),
  unlink = Promise.promisify(fs.unlink),
  exists = Promise.promisify(fs.exists),
  output = '../build/opencc.js';

var convert = function (text, dictionary, maxLength) {
  var
    converted = [];

  for (var i = 0; i < text.length; i++) {
    var found = false;

    for (var j = maxLength; j > 0; j--) {
      var
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

var hk2s = function (text) {
  var e = window.opencc, c = e.convert;
  text = c(text, $.extend(e.HKVariantsRevPhrases, e.HKVariantsReverse), Math.max(e.HKVariantsRevPhrasesMaxLength, e.HKVariantsReverseMaxLength));
  return c(text, $.extend(e.TSPhrases, e.TSCharacters), Math.max(e.TSPhrasesMaxLength, e.TSCharactersMaxLength));
};

var s2hk = function (text) {
  var e = window.opencc, c = e.convert;
  text = c(text, $.extend(e.STPhrases, e.STCharacters), Math.max(e.STPhrasesMaxLength, e.STCharactersMaxLength));
  return c(text, $.extend(e.HKVariantsPhrases, e.HKVariants), Math.max(e.HKVariantsPhrasesMaxLength, e.HKVariantsMaxLength));
};

var s2t = function (text) {
  var e = window.opencc, c = e.convert;
  return c(text, $.extend(e.STPhrases, e.STCharacters), Math.max(e.STPhrasesMaxLength, e.STCharactersMaxLength));
};

var s2tw = function (text) {
  var e = window.opencc, c = e.convert;
  text = c(text, $.extend(e.STPhrases, e.STCharacters), Math.max(e.STPhrasesMaxLength, e.STCharactersMaxLength));
  return c(text, e.TWVariants, e.TWVariantsMaxLength);
};

var s2twp = function (text) {
  var e = window.opencc, c = e.convert;
  text = c(text, $.extend(e.STPhrases, e.STCharacters), Math.max(e.STPhrasesMaxLength, e.STCharactersMaxLength));
  return c(text, $.extend(e.TWPhrasesIT, e.TWPhrasesName, e.TWPhrasesOther, e.TWVariants), Math.max(e.TWPhrasesITMaxLength, e.TWPhrasesNameMaxLength, e.TWPhrasesOtherMaxLength, e.TWVariantsMaxLength));
};

var t2hk = function (text) {
  var e = window.opencc, c = e.convert;
  return c(text, e.HKVariants, e.HKVariantsMaxLength);
};

var t2s = function (text) {
  var e = window.opencc, c = e.convert;
  return c(text, $.extend(e.TSPhrases, e.TSCharacters), Math.max(e.TSPhrasesMaxLength, e.TSCharactersMaxLength));
};

var t2tw = function (text) {
  var e = window.opencc, c = e.convert;
  return c(text, e.TWVariants, e.TWVariantsMaxLength);
};

var tw2s = function (text) {
  var e = window.opencc, c = e.convert;
  text = c(text, $.extend(e.TWVariantsRevPhrases, e.TWVariantsReverse), Math.max(e.TWVariantsRevPhrasesMaxLength, e.TWVariantsReverseMaxLength));
  return c(text, $.extend(e.TSPhrases, e.TSCharacters), Math.max(e.TSPhrasesMaxLength, e.TSCharactersMaxLength));
};

var tw2sp = function (text) {
  var e = window.opencc, c = e.convert;
  text = c(text, $.extend(e.TWVariantsRevPhrases, e.TWVariantsReverse), Math.max(e.TWVariantsRevPhrasesMaxLength, e.TWVariantsReverseMaxLength));
  text = c(text, $.extend(e.TWPhrasesITReverse, e.TWPhrasesNameReverse, e.TWPhrasesOtherReverse), Math.max(e.TWPhrasesITReverseMaxLength, e.TWPhrasesNameReverseMaxLength, e.TWPhrasesOtherReverseMaxLength));
  return c(text, $.extend(e.TSPhrases, e.TSCharacters), Math.max(e.TSPhrasesMaxLength, e.TSCharactersMaxLength));
};

function genDictionary(filename, options) {
  const reverse = (options || {}).reverse;
  
  return readFile(path.resolve(module.filename, '../../opencc-database/data/dictionary/', filename), 'utf8')
    .then(text => text.split('\n').reduce((map, line) => {
      if (line) {
        const tokens = line.split('\t').slice(0, 2);

        tokens[1] = tokens[1].split(' ')[0];

        reverse && tokens.reverse();
        map[tokens[0]] = tokens[1];
      }

      return map;
    }, {}))
    .then(map => {
      const
        maxLength = Object.keys(map).reduce(function (maxLength, word) { return Math.max(maxLength, word.length); }, 0),
        root = path.basename(filename, '.txt') + (reverse ? 'Reverse' : '');
        
      var js = `window.opencc.${root}MaxLength=${maxLength};window.opencc.${root}=${JSON.stringify(map)};`;
      return writeFile(output, js, { flag: 'a' });
    });
}

function genHeader() {
  var
    code1 = UglifyJS.minify('window.opencc.convert=' + convert.toString(), { fromString: true }).code,
    allCodes = [];
    
  ['hk2s', 's2hk', 's2t', 's2tw', 's2twp', 't2hk', 't2s', 't2tw', 'tw2s', 'tw2sp'].forEach(f => {
    allCodes.push(UglifyJS.minify(`window.opencc.${f}=${eval(f).toString()}`, { fromString: true }).code);
  });

  return writeFile(output, `window.opencc=window.opencc||{};${code1}${allCodes.join('')}`);
}

unlink(output)
.catch(e => e)
.then(() => genHeader())
.then(() => genDictionary('HKVariants.txt'))
.then(() => genDictionary('HKVariants.txt', { reverse: true }))
.then(() => genDictionary('HKVariantsPhrases.txt'))
.then(() => genDictionary('HKVariantsRevPhrases.txt'))
.then(() => genDictionary('STCharacters.txt'))
.then(() => genDictionary('STPhrases.txt'))
.then(() => genDictionary('TSCharacters.txt'))
.then(() => genDictionary('TSPhrases.txt'))
.then(() => genDictionary('TWPhrasesIT.txt'))
.then(() => genDictionary('TWPhrasesIT.txt', { reverse: true }))
.then(() => genDictionary('TWPhrasesName.txt'))
.then(() => genDictionary('TWPhrasesName.txt', { reverse: true }))
.then(() => genDictionary('TWPhrasesOther.txt'))
.then(() => genDictionary('TWPhrasesOther.txt', { reverse: true }))
.then(() => genDictionary('TWVariants.txt'))
.then(() => genDictionary('TWVariants.txt', { reverse: true }))
.then(() => genDictionary('TWVariantsRevPhrases.txt'));