'use strict';

const mkdirp = require('mkdirp');

function mkdirpPromise(filename) {
  return new Promise((resolve, reject) => {
    mkdirp(filename, (err, made) => err ? reject(err) : resolve(made));
  });
}

module.exports = mkdirpPromise;
