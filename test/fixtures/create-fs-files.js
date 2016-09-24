import fs from 'fs';
import { dirname } from 'path';
import pify from 'pify';
import mkdirp from 'mkdirp';

const writeFile = pify(fs.writeFile);
const mkdir = pify(mkdirp);

export function createFile(path) {
  const dir = dirname(path);

  return mkdir(dir)
    .then(() => writeFile(path));
}

export function isFileExists(path) {
  return new Promise(resolve => fs.exists(path, resolve));
}
