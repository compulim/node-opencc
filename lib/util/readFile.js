'use strict';

const fs = require('fs');

function readFile(filename, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, encoding, (err, data) => err ? reject(err) : resolve(data));
  });
}

module.exports = readFile;