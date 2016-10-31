import request from 'superagent';
import cheerio from 'cheerio';

const baseUrl = 'http://www.dvdsreleasedates.com';

export function search(query) {
  return _search(query)
    .then(movies => Promise.all(
      movies.slice(0, 5).map(getMovie)
    ));
}

export function getMovie(movie) {
  return request
    .get(movie.url)
    .then(data => {
      const $ = cheerio.load(data.text);

      try {
        let el = $('span.past');

        if (el.length === 0) {
          el = $('span.future');
        }

        const date = new Date($(el.get(0)).text());
        movie.releaseDate = date.toISOString();
      } catch (e) {
        //
      }

      movie.img = `${baseUrl}${$('img[itemprop="image"]').get(0).attribs.src}`;


      const imdbUrl = $('a[href^="http://www.imdb.com/title"]').get(0).attribs.href;
      movie.imdb = /tt\d+/.exec(imdbUrl)[0];

      return movie;
    });
}

export function _search(query) {
  return request
    .get(`${baseUrl}/livesearch.php?q=${encodeURIComponent(query)}`)
    .then(data => {
      const $ = cheerio.load(data.text);

      return $('a')
        .map((i, el) => {
          const $el = $(el);

          return {
            title: $el.text(),
            url: `${baseUrl}${el.attribs['href']}`
          };
        })
        .get();
    });
}
