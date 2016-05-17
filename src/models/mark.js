const createId = ({ imdb, s, ep }) => [imdb, s, ep].join(':');
const associate = () => {};

const indexes = {
  UPDATED_AT: {
    name: 'UPDATED_AT_1',
    /*eslint-disable */
    fn: (doc) => {
      emit(doc.updatedAt + '$' + doc._id);
    }
    /*eslint-enable */
  }
};

export default { createId, associate, indexes };
