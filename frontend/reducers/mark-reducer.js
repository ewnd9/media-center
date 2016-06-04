import {
  REQUEST_MARK,
  RECIEVE_MARK
} from '../actions/marks-actions';

import { fromSrt } from 'subtitles-parser';
import { sortBy } from 'lodash';

function mark(state = {
  isFetching: false,
  mark: null,
  lines: null,
  active: 0
}, action) {
  switch (action.type) {
    case REQUEST_MARK:
      return {
        ...state,
        isFetching: true
      };
    case RECIEVE_MARK:
      return recieveMark(state, action);
    default:
      return state;
  }
}

export default mark;

function recieveMark(state, { mark }) {
  const originalLines = fromSrt(mark.subtitles)
    .map(line => {
      line.startTimeMs = srtTimeToMs(line.startTime);
      line.endTimeMs = srtTimeToMs(line.endTime);

      return line;
    });

  const lines = originalLines.concat(mark.marks.map(mark => {
    const startTimeMs = mark.position / 1000;
    return { startTimeMs };
  }));

  return {
    ...state,
    isFetching: false,
    mark,
    lines: sortBy(lines, 'startTimeMs')
  };
}

function srtTimeToMs(str) {
  const [rest, ms] = str.split(',');
  const [ h, m, s ] = rest.split(':');

  return +h * 60 * 60 * 1000 + +m * 60 * 1000 + +s * 1000 + +ms;
}
