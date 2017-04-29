'use strict';

const fs = require('fs');

function writeFile(filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, err => err ? reject(err) : resolve());
  });
}

module.exports = writeFile;
