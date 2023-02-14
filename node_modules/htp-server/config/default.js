const pkg = require('../package.json');
const defaults = {
  pkgName: pkg.name,
  address: '127.0.0.1',
  port: 4000,
  dir: true,
  index: true,
  gzip: false
};

module.exports = defaults;