'use strict';

const assert = require('assert');
const fs     = require('mz/fs');
const opencc = require(`../${ require('../package.json').main }`);

describe('Regression tests', () => {
  it('should not translate "constructor"', () => {
    const content = 'constructor';
    const actual  = opencc.hongKongToSimplified(content);

    assert(content === actual);
  });
});
