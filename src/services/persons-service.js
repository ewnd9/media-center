import { imdbIndex as personImdbIndex, isFavoriteIndex } from '../models/person';
export default PersonsService;

function PersonsService(config, db) {
  if (!(this instanceof PersonsService)) {
    return new PersonsService(config, db);
  }

  this.config = config;
  this.db = db;
}

PersonsService.prototype._formatTmdbPersonData = function(person) {
  const data = {
    tmdb: person.id,
    imdb: person.imdb_id,
    name: person.name,
    isFavorite: true,
    tmdbData: person,
    syncedAt: new Date().toISOString()
  };

  return data;
};

PersonsService.prototype.syncPersonTmdb = function({ tmdb, imdb }) {
  const { services: { tmdbService } } = this;
  const tmdbApi = tmdbService.getTmdbApi();
  const fn = tmdb ? tmdbApi.getPerson(tmdb) : tmdbApi.getPersonByImdb(imdb);

  return fn.then(person => this._formatTmdbPersonData(person));
};

PersonsService.prototype.findPerson = function({ tmdb, imdb }) {
  const { db: { Person } } = this;

  if (tmdb) {
    return Person
      .findOneOrInit(
        { tmdb },
        () => this.syncPersonTmdb({ tmdb, imdb }).then(data => Person.put(data))
      );
  } else {
    return Person.db
      .query(personImdbIndex, { key: imdb, include_docs: true })
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows[0].doc;
        } else {
          return this.syncPersonTmdb({ tmdb, imdb }).then(data => Person.put(data));
        }
      });
  }
};

PersonsService.prototype.findFavoritePersons = function() {
  const { db: { Person } } = this;

  return Person
    .findByIndex(isFavoriteIndex);
};

PersonsService.prototype.addPerson = function(tmdb) {
  const { services: { recommendationsService } } = this;
  let person;

  return this.findPerson({ tmdb })
    .then(_person => {
      person = _person;
      return recommendationsService.addMoviesByPerson(person);
    })
    .then(() => person);
};
