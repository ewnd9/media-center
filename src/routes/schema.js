import t from 'tcomb';

import { schema as fileSchema } from '../models/file';
import { schema as showSchema } from '../models/show';
import { schema as movieSchema } from '../models/movie';
import { schema as personSchema } from '../models/person';

export const CastableNumber = t.refinement(t.String, n => !isNaN(n), 'CastableNumber');

export const paginationSchema = t.struct({
  limit: t.maybe(CastableNumber),
  since: t.maybe(t.String),
  page: t.maybe(CastableNumber)
});

export const statusStringResponse = t.struct({
  status: t.String
});

export const fileScrobbleRequestSchema = t.struct({
  filename: t.String,
  media: fileSchema
});

export const filesArrayResponseSchema = t.list(t.struct({
  key: t.String,
  media: t.list(
    t.struct({
      file: t.String,
      dir: t.String,
      fileName: t.String,
      dirName: t.String,
      recognition: t.struct({
        title: t.String,
        s: t.maybe(t.Number),
        ep: t.maybe(t.Number),
        year: t.maybe(t.Number),
        type: t.String
      }),
      db: t.maybe(fileSchema),
      watched: t.maybe(t.Boolean),
      hidden: t.maybe(t.Boolean),
      isTorrent: t.maybe(t.Boolean),
      torrentProgress: t.maybe(t.Number)
    })
  ),
  dir: t.String,
  watched: t.Boolean,
  hidden: t.Boolean,
  imdb: t.maybe(t.String),
  s: t.maybe(t.Number),
  type: t.maybe(t.String),
  title: t.maybe(t.String),
  unwatchedCount: t.maybe(t.Number),
  summary: t.String,
  posterUrl: t.String
}));


export const filePositionRequestSchema = t.struct({
  filename: t.String,
  media: fileSchema,
  position: t.Number,
  duration: t.Number
});

export const fileHiddenRequestSchema = t.struct({
  filename: t.String,
  file: t.String
});

export const playbackStartRequestSchema = fileScrobbleRequestSchema.extend({
  position: t.maybe(t.Number),
  noScrobble: t.maybe(t.Boolean)
});

export const playbackInfoResponseSchema = t.struct({
  progress: t.Number,
  position: t.Number,
  duration: t.Number,
  status: t.String,
  file: t.String,
  media: t.maybe(fileSchema)
});

export const fileResponseSchema = t.struct({
  file: fileSchema
});

export const traktSuggestionsResponseSchema = t.list(t.struct({ label: t.String, value: t.String }));
export const dvdReleasesSuggestionsResponseSchema = t.struct({
  suggestions: t.list(
    t.struct({
      title: t.String,
      img: t.String,
      url: t.String,
      imdb: t.String,
      releaseDate: t.maybe(t.String)
    })
  )
});

export const traktIds = t.struct({
  trakt: t.maybe(t.Number),
  slug: t.maybe(t.String),
  tvdb: t.maybe(t.Number),
  imdb: t.maybe(t.String),
  tmdb: t.maybe(t.Number),
  tvrage: t.maybe(t.Number)
});

export const traktReportEpisode = t.struct({
  season: t.Number,
  number: t.Number,
  title: t.maybe(t.String),
  ids: traktIds
});

export const traktReportShow = t.struct({
  title: t.String,
  year: t.Number,
  ids: traktIds
});

export const traktReport = t.struct({
  first_aired: t.String,
  episode: traktReportEpisode,
  show: traktReportShow,
  date: t.String
});

export const traktReportGaps = t.struct({
  gap: t.Number,
  episodes: t.list(traktReport)
});

export const traktShow = showSchema.extend({
  episodes: t.list(t.Object),
  posterUrl: t.String
});

export const traktReportResponseSchema = t.struct({
  report: t.list(
    traktShow
  )
});

export const traktShowResponseSchema = t.struct({
  show: traktShow
});

export const traktMovie = movieSchema.extend({
  posterUrl: t.String
});

export const traktMovieResponseSchema = t.struct({
  movie: traktMovie
});

export const traktMoviesResponseSchema = t.struct({
  movies: t.list(traktMovie)
});

export const screenshotsResponseSchema = t.struct({ files: t.list(t.String) });

export const youtubeRequestSchema = t.struct({ query: t.String });

export const traktPersonResponse = t.struct({
  person: personSchema
});

export const torrentMagnet = t.struct({
  magnet: t.String
});
