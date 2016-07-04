import { USER_ANALYTICS } from '../constants';

import OpenSubtitles from 'opensubtitles-universal-api';
import { fromSrt } from 'subtitles-parser';
import nlp from 'nlp_compromise';
import { sortBy } from 'lodash';
import sanitize from 'sanitize-html';
import got from 'got';

import getPosterUrl from '../utils/poster-url';

function MarksService({ Mark, Subtitles }, storage) {
  this.Mark = Mark;
  this.Subtitles = Subtitles;

  this.storage = storage;
  this.api = new OpenSubtitles('OSTestUserAgent');

  this.findByIndex = this.Mark.findByIndex.bind(this.Mark);

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
    .findOne(id)
    .then(
      mark => {
        mark.marks.push(data);

        return this.Mark.put(id, mark);
      },
      err => this.Mark.onNotFound(err, () => {
        const mark = {
          ...media,
          marks: [data]
        };

        return this.Mark.put(id, mark);
      })
    );
};

MarksService.prototype.findAll = function(limit, since) {
  return this
    .findByIndex(this.Mark.indexes.UPDATED_AT.name, {
      descending: true,
      since,
      limit
    });
};

MarksService.prototype.findAllWithPosterUrls = function(limit, since, host) {
  return this
    .findAll(limit, since)
    .then(marks => {
      marks.forEach(mark => {
        mark.posterUrl = getPosterUrl(mark.type, mark.imdb, mark.s, host);
      });

      return marks;
    });
};

MarksService.prototype.findOne = function(id) {
  let mark;

  return this.Mark
    .findById(id)
    .then(_mark => {
      mark = _mark;
      return this.getSubtitles(mark.imdb, mark.s, mark.ep);
    })
    .then(subtitles => {
      const originalSrt = fromSrt(subtitles.text)
        .map(srt => {
          srt.startTimeMs = srtTimeToMs(srt.startTime);
          srt.endTimeMs = srtTimeToMs(srt.endTime);

          const sanitized = sanitize(srt.text, {
            // @TODO figure out how to keep tags with nlp
            // probably I need to transform the text to a tree
            allowedTags: [],
            allowedAttributes: []
            // allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
          }).replace(/\&quot\;/g, '"');

          srt.text = sanitized
            .split('\n')
            .map(text => {
              return nlp.text(text).sentences
                .map(sentence => {
                  return sentence.terms;
                });
            });

          return srt;
        });

      const lines = originalSrt.concat(mark.marks.map(mark => {
        const startTimeMs = mark.position / 1000;
        return { startTimeMs };
      }));

      mark.subtitles = sortBy(lines, 'startTimeMs');
      return mark;
    });
};

MarksService.prototype.getSubtitles = function(imdb, s, ep) {
  return this.Subtitles.findOneOrInit({ imdb, s, ep }, this.fetchSubtitlesFromApi.bind(this, imdb, s, ep));
};

MarksService.prototype._fetchSubtitlesFromApi = function(imdb, s, ep) {
  const query = {
    imdbid: imdb,
    season: s,
    episode: ep
  };

  return this.api.search(query)
    .then(result => {
      const url = result.en[0].url;
      return got(url);
    })
    .then(({ body }) => {
      return body;
    });
};

MarksService.prototype.fetchSubtitlesFromApi = function(imdb, s, ep) {
  return this._fetchSubtitlesFromApi(imdb, s, ep)
    .then(body => {
      const subtitles = {
        imdb,
        s,
        ep,
        text: body,
        lang: 'en'
      };

      return this.Subtitles.put(subtitles);
    });
};

export default function(models, storage) {
  return new MarksService(models, storage);
}

function srtTimeToMs(str) {
  const [rest, ms] = str.split(',');
  const [ h, m, s ] = rest.split(':');

  return +h * 60 * 60 * 1000 + +m * 60 * 1000 + +s * 1000 + +ms;
}
