'use strict'

const path = require('path');
const fs = require('fs');
const debugDev = require('debug')('dev:libIndex');
const {pipe} = require('../lib/feature');
const {updateTemplate, recordComparison, defaultTemplate, renderOptions} = require('./utils');
const validateHash = recordComparison('dirs');


const readDir = function(res, dir, pathname){
  try {
    const file = path.join(dir, 'index.html');
    const fd = fs.statSync(file);
    if (fd.isFile()) {
      req.stat = fd;
      pipe(req, res, dir);
      return;
    }
  } catch(e) {
    debugDev(e);
    let dirs = fs.readdirSync(dir);
    if (dirs.length > 0) {
      const tpl = fs.readFileSync(defaultTemplate, 'utf-8');
      let renderData = renderOptions({dirs, pathname});
      const isChange = validateHash(JSON.stringify(renderData));
      const file = updateTemplate(isChange, tpl, renderData);
      fs.createReadStream(file).pipe(res);
    } else {
      res.end('This dir is no file!')
    }
  }
};

const staticDir = function(req, res, rootDir, pathname){
  try{
    const dir = path.join(rootDir, pathname);
    const fd = fs.statSync(dir);
    if (fd.isFile()) {
      req.stat = fd;
      pipe(req, res, dir);
      return;
    } else {
      readDir(res, dir, pathname);
    }
  }catch(e){
    debugDev(e);
    console.log(e);
    res.end('not found 404');
  }
};

exports.staticDir = staticDir