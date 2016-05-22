import fs from 'fs';
import got from 'got';

import pify from 'pify';
const access = pify(fs.access);

export default function fsCache(filePath, urlFn) {
  return access(filePath)
    .then(() => {
      return fs.createReadStream(filePath);
    }, err => {
      if (err.code === 'ENOENT') {
        return createWebRequest(filePath, urlFn);
      } else {
        throw err;
      }
    });
}

function createWebRequest(filePath, urlFn) {
  return urlFn()
    .then(url => {
      const stream = got.stream(url);
      stream.pipe(fs.createWriteStream(filePath));
      return stream;
    });
}
