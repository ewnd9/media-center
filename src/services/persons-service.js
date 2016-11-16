import { imdbIndex as personImdbIndex } from '../models/person';

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

PersonsService.prototype._updatePerson = function(tmdb, imdb) {
  const { services: { tmdbService } } = this;
  const tmdbApi = tmdbService.getTmdbApi();

  const fn = tmdb ? tmdbApi.getPerson(tmdb) : tmdbApi.getPersonByImdb(imdb);

  return fn.then(person => this._formatTmdbPersonData(person));
};

PersonsService.prototype._fetchPerson = function(tmdb, imdb) {
  const { db: { Person } } = this;

  const fn = tmdb ? (
    Person
      .findOneOrInit(
        { tmdb },
        () => this._updatePerson(tmdb, imdb).then(data => Person.put(data))
      )
  ) : (
    Person.db
      .query(personImdbIndex, { key: imdb, include_docs: true })
      .then(res => {
        if (res.rows.length > 0) {
          return res.rows[0].doc;
        } else {
          return this._updatePerson(tmdb, imdb).then(data => Person.put(data));
        }
      })
  );

  return fn;
};

PersonsService.prototype.findPerson = function(tmdb) {
  return this._fetchPerson(tmdb, null);
};

PersonsService.prototype.findPersonByImdb = function(imdb) {
  return this._fetchPerson(null, imdb);
};

PersonsService.prototype.addPerson = function(tmdb) {
  const { db: { MovieScrobble }, services: { recommendationsService } } = this;

  let person;

  return this._fetchPerson(tmdb, null)
    .then(_person => {
      person = _person;
      return MovieScrobble.findAll();
    })
    .then(movies => {
      const unseen = person.tmdbData.movie_credits.cast
        .filter(movie => {
          return !movies.find(seenMovie => seenMovie.tmdb === movie.id);
        });

      const promises = unseen.map(movie => {
        return recommendationsService.graphPut({
          subject: person._id,
          predicate: 'in',
          object: movie.id // external movie, id is tmdb
        });
      });

      return Promise.all(promises);
    })
    .then(() => person);
};
