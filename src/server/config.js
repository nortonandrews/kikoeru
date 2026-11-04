const fs = require('fs');
const path = require('path');

module.exports = (() => JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'config.json'),
  ).toString(),
))();
