'use strict';

async function promiseReduce(array, reducer, result) {
  for (let index = 0, { length } = array; index < length; index++) {
    result = await reducer.call(array, result, array[index], index);
  }

  return result;
}

module.exports = promiseReduce;
