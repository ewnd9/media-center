import {
  REQUEST_TRAKT_REPORT,
  RECIEVE_TRAKT_REPORT
} from '../actions/trakt-report-actions';

import moment from 'moment';
import { formatEpisode as format } from 'show-episode-format';

function traktReport(state = {
  isFetching: false,
  report: null
}, action) {
  switch (action.type) {
    case REQUEST_TRAKT_REPORT:
      return {
        ...state,
        isFetching: true
      };
    case RECIEVE_TRAKT_REPORT:
      return recieveTraktReport(state, action);
    default:
      return state;
  }
}

export default traktReport;

function recieveTraktReport(state, { report }) {
  report.forEach(reports => {
    reports.forEach(item => {
      const { report } = item;
      const titles = [];

      const formatInterval = eps =>
        `${format(eps[0].episode)} - ${format(eps[eps.length - 1].episode)} (${eps.length})`;

      if (report.aired.length > 0) {
        titles.push(`${formatInterval(report.aired)} available`);
      }

      const now = new Date();

      if (report.future.length > 0) {
        report.future.forEach(report => {
          const length = report.episodes.length;
          const date = moment(report.episodes[0].first_aired);
          const day = date.format('ddd');

          const awaiting = (
            report.gap === 0 ?
              `${date.diff(now, 'hours')} hours (${day})` :
              `${report.gap + 1} days (${day})`
          );

          if (length === 1) {
            titles.push(`${format(report.episodes[0].episode)} in ${awaiting}`);
          } else {
            titles.push(`${formatInterval(report.episodes)} every week in ${awaiting}`);
          }
        });

        item.titles = titles;
      }
    });
  });

  return {
    ...state,
    isFetching: false,
    report
  };
}
