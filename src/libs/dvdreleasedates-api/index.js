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

      const date = new Date($($('.past').get(0)).text());
      movie.releaseDate = date.toISOString();

      return movie;
    });
}

export function _search(query) {
  return request
    .post(`${baseUrl}/search.php`)
    .send(`searchStr=${query}`)
    .then(data => {
      const $ = cheerio.load(data.text);

      return $('.dvdcell')
        .map((i, el) => {
          const $el = $(el);
          const links = $el.find('a');
          const imdbUrl = links.get(links.length - 1).attribs['href'];
          const imdb = /tt\d+/.exec(imdbUrl)[0];

          return {
            title: $(links.get(1)).text(),
            img: $el.find('img').attr('src'),
            url: `${baseUrl}${links.get(0).attribs['href']}`,
            imdb
          };
        })
        .get();
    });
}
