# Translates between Traditional and Simplified Chinese in pure Node.js [![Build Status](https://travis-ci.org/compulim/node-opencc.svg?branch=master)](https://travis-ci.org/compulim/node-opencc)

(This library use [OpenCC](https://github.com/byvoid/opencc) for its dictionary database and test data)

OpenCC is a translation library for Traditional and Simplified Chinese with dictionary of localized phrases and verbs. But it only runs on Python (or Node.js with Python installed).

`node-opencc` is a brand new project that imports OpenCC database and test case, and translates text without installing any native components.

## Usage
You can only access `node-opencc` programmatically. Since dictionaries are huge, they are loaded asynchronously with Promise interface. Thus, all translations on `node-opencc` will return `thenable`.

For example,

```
const opencc = require('node-opencc');

opencc.hongKongToSimplified('滑鼠').then(result => result === '鼠标');
opencc.traditionalToHongKong('僞').then(result => result === '偽');
```

`node-opencc` supports multiple type of translations:
* Hong Kong to Simplified Chinese (`hongKongToSimplified`)
* Simplified Chinese to Hong Kong (`simplifiedToHongKong`)
* Simplified Chinese to Traditional Chinese (`simplifiedToTraditional`)
* Simplified Chinese to Taiwan (`simplifiedToTaiwan`)
* Simplified Chinese to Taiwan with phrases (`simplifiedToTaiwanWithPhrases`)
* Traditional Chinese to Hong Kong (`traditionalToHongKong`)
* Traditional Chinese to Simplified Chinese (`traditionalToSimplified`)
* Traditional Chinese to Taiwan (`traditionalToTaiwan`)
* Taiwan to Simplified Chinese (`taiwanToSimplified`)
* Taiwan to Simplified Chinese with phrases (`taiwanToSimplifiedWithPhrases`)

## What's not working
Although `node-opencc` tries to redo `OpenCC` with pure JavaScript, there are features that are not working as in `OpenCC`. `node-opencc` currently _do not_ support the following features:

* Multiple alternative phrases, verbs, and characters

## Changelog
* 2016-02-25 (0.0.1): First public release

## Contribution
You may want to head to [OpenCC](https://github.com/byvoid/opencc) for dictionary contribution.

Love this extension? [Star](https://github.com/compulim/node-opencc/stargazers) us!

Want to make this extension even more awesome? [Send us your wish](https://github.com/compulim/node-opencc/issues/new/).

Hate how it is working? [File an issue](https://github.com/compulim/node-opencc/issues/new/) to us.

To contribute to the code base of `node-opencc`, please file a pull request with unit tests.
