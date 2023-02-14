const {createHash} = require('crypto');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const debugDev = require('debug')('dev:htp-server');
const {getConfig} = require('../config/config');
const config = getConfig();
const defaultTemplate = path.join(__dirname, '../template', 'index.html');

const getKey = (source) => {
  return (tag) => {
    return source.filter((memo) => {
      const keys = Object.keys(memo);
      if (tag.includes(keys)) {
        return memo;
      }
    })
  }
};

// merge render data
const renderOptions = function(renderData){
  let {dirs, pathname} = renderData;
  dirs = dirs.reduce((arr, next, i) => {
    const ref = (pathname === '\/' ? '' : pathname) + '/' + next;
    arr[i] = {'filename': next, 'link': ref}
    return arr;
  },[]);
  let result = {};
  result.data = dirs;
  if (!config) {
    config = getConfig();
  }
  return Object.assign({}, result, {options: config})
}

// generator hash
const genHash = (c) => {
  const hash = createHash('md5');
  return hash.update(c).digest('hex');
}

// hash change
const recordComparison = (tag) => {
  const cache = {};
  return (c) => {
    if (!cache[tag]) {
      cache[tag] = genHash(c);
      return false;
    } else {
      const olderHash = cache[tag];
      const nHash = genHash(c);
      if (nHash === olderHash) {
        return true;
      } else {
        return false;
      }
    }
  }
}

// update template
const updateTemplate = (flg, tpl, renderData) => {
  const fileTmp = path.join(__dirname, '../template', 'tmp.html');
  if (flg === false) {
    if (fs.existsSync(fileTmp)) {
      fs.unlinkSync(fileTmp);
    }
    try {
      fs.accessSync(fileTmp);
    } catch(e) {
      debugDev(e);
      const html = ejs.render(tpl, renderData);
      fs.writeFileSync(fileTmp, html);
    }
  }
  return fileTmp;
}

module.exports = {
  defaultTemplate,
  recordComparison,
  renderOptions,
  updateTemplate,
  getKey
};