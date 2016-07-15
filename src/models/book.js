import t from 'tcomb-validation';

const Book = {
  createId: ({ filename }) => filename,
  schema: t.struct({
    _id: t.maybe(t.String),
    _rev: t.maybe(t.String),
    _key: t.maybe(t.String),
    updatedAt: t.maybe(t.String),

    title: t.String,
    filename: t.String
  }),
  associate: () => {},
  indexes: {
    UPDATED_AT: {
      name: 'UPDATED_AT_1',
      fn: `function(doc) {
        emit(doc.updatedAt + '$' + doc._id);
      }`
    }
  }
};

export const schema = Book.schema;
export default Book;
