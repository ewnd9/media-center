import { USER_ANALYTICS } from '../constants';

function MarksService({ Mark }, storage) {
  this.Mark = Mark;
  this.storage = storage;

  this.query = this.Mark.query.bind(this.Mark);

  this.storage.on(USER_ANALYTICS, () => {
    if (this.storage.lastPlaybackStatus) {
      this.add(this.storage.lastPlaybackStatus);
    } else {
      console.log('no playback');
    }
  });
}

MarksService.prototype.add = function(data) {
  const id = data.media || { imdb: 0 };

  const media = data.media;
  delete data.media;

  return this.Mark
    .get(id)
    .then(mark => {
      mark.marks.push(data);

      return this.Mark.put(id, mark);
    }, err => this.Mark.on404(err, () => {
      const mark = {
        ...media,
        marks: [data]
      };

      return this.Mark.put(id, mark);
    }));
};

MarksService.prototype.findAll = function(limit, since) {
  return this
    .query(this.Mark.indexes.UPDATED_AT.name, {
      descending: true,
      skip: since ? 1 : 0,
      endkey: since, 
      limit
    });
};

export default function(models, storage) {
  return new MarksService(models, storage);
}
