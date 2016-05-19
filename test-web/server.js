'use strict';

const
  http = require('http'),
  fs = require('fs'),
  express = require('express'),
  path = require('path'),
  app = express(),
  port = process.argv[2] || 8081;
  
app.use(express.static(__dirname));
app.use('/opencc.js', (req, res) => {
  var file = fs.readFileSync(path.join(__dirname, '../build/opencc.js'), 'binary');

  res.setHeader('Content-Length', file.length);
  res.write(file, 'binary');
  res.end();
});
app.listen(port, () => console.log('Listening on port ' + port));