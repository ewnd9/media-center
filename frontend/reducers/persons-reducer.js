import { createCheckedReducer } from './utils';
import t from 'tcomb';

import {
  UPDATE_FAVORITE_STATUS_REQUEST,
  UPDATE_FAVORITE_STATUS_SUCCESS,
  UPDATE_FAVORITE_STATUS_FAILURE,

  FETCH_PERSON_REQUEST,
  FETCH_PERSON_SUCCESS,
  FETCH_PERSON_FAILURE
} from '../actions/persons-actions';

import {
  FETCH_MOVIE_SUCCESS
} from '../actions/movies-actions';

import {
  FETCH_SHOW_SUCCESS
} from '../actions/trakt-report-actions';

export const schema = t.struct({
  persons: t.dict(t.String, t.Object),
  changingStatusKey: t.maybe(t.Number)
});

export default createCheckedReducer({
  persons: {},
  changingStatusKey: null
}, {
  [UPDATE_FAVORITE_STATUS_REQUEST](state, action) {
    return {
      ...state,
      changingStatusKey: action.id
    };
  },
  [UPDATE_FAVORITE_STATUS_SUCCESS](state, action) {
    const { persons } = state;
    const { person } = action.response;

    return {
      ...state,
      changingStatusKey: null,
      persons: {
        ...persons,
        [person.tmdb]: {
          isFavorite: person.isFavorite
        }
      }
    };
  },
  [UPDATE_FAVORITE_STATUS_FAILURE](state) {
    return {
      ...state,
      changingStatusKey: null
    };
  },
  [FETCH_PERSON_REQUEST](state) {
    return {
      ...state,
      person: null
    };
  },
  [FETCH_PERSON_SUCCESS](state, action) {
    return {
      ...state,
      person: action.response.person
    };
  },
  [FETCH_PERSON_FAILURE](state) {
    return {
      ...state
    };
  },
  [FETCH_MOVIE_SUCCESS](state, action) {
    return reducePersonsByMedia(state, action.response.movie.tmdbData.credits);
  },
  [FETCH_SHOW_SUCCESS](state, action) {
    return reducePersonsByMedia(state, action.response.show.tmdbData.credits);
  }
}, schema);

function reducePersonsByMedia(state, credits) {
  const persons = reduceDict(credits.cast.concat(credits.crew), 'id', ['isFavorite']);

  return {
    ...state,
    persons: {
      ...state.persons,
      ...persons
    }
  };
}

function reduceDict(items, id, props) {
  return items.reduce(
    (total, curr) => {
      total[curr[id]] = props ? reduceProps(curr, props): curr;
      return total;
    },
    {}
  );
}

function reduceProps(item, props) {
  return props.reduce(
    (total, curr) => {
      total[curr] = item[curr];
      return total;
    },
    {}
  );
}
