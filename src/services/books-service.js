import fs from 'fs';
import { resolve } from 'path';
import parseEpub from '../libs/epub-parser';

function BooksService(Book, booksPath) {
  this.Book = Book;
  this.booksPath = booksPath;
}

BooksService.prototype.findAll = function(limit, since) {
  return this.Book
    .findByIndex(this.Book.indexes.UPDATED_AT.name, {
      descending: true,
      since,
      limit
    });
};

BooksService.prototype.findById = function(id) {
  let book;

  return this.Book
    .findById(id)
    .then(_book => {
      book = _book;
      return parseEpub(`${this.booksPath}/${book.filename}`);
    })
    .then(content => {
      book.content = content;
      return book;
    });
};

BooksService.prototype.getWriteStream = function(filename) {
  return fs.createWriteStream(resolve(this.booksPath, filename));
};

BooksService.prototype.saveBook = function(filename, title) {
  const book = { filename, title };
  return this.Book
    .findOne(book)
    .then(
      book => book,
      err => this.Book.onNotFound(err, () => {
        return this.Book.put(book);
      })
    );
};

export default ({ Book }, booksPath) => {
  return new BooksService(Book, booksPath);
};
