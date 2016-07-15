import fs from 'fs';
import pify from 'pify';
import { resolve } from 'path';

function BooksService(db, booksPath) {
  this.db = db;
  this.booksPath = booksPath;
}

BooksService.prototype.getWriteStream = function(filename) {
  return fs.createWriteStream(resolve(this.booksPath, filename));
};

export default (db, booksPath) => {
  return new BooksService(db, booksPath);
};
