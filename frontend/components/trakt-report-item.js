import React from 'react';
import moment from 'moment';

export default ({ report, show }) => {
  const titles = [];

  const tr = n => n < 10 ? '0' + n : n;
  const format = ep => `${tr(ep.season)}x${tr(ep.number)}`;
  const formatInterval = eps =>
    `${format(eps[0].episode)} - ${format(eps[eps.length - 1].episode)} (${eps.length})`;

  let showId;

  if (report.aired.length > 0) {
    showId = report.aired[0].show.ids.slug;
    titles.push(`${formatInterval(report.aired)} available`);
  }

  const now = new Date();

  if (report.future.length > 0) {
    showId = report.future[0].episodes[0].show.ids.slug;

    report.future.forEach(report => {
      const length = report.episodes.length;
      const awaiting = (
        report.gap === 0 ?
          `${moment(report.episodes[0].first_aired).diff(now, 'hours')} hours` :
          `${report.gap + 1} days`
      );

      if (length === 1) {
        titles.push(`${format(report.episodes[0].episode)} in ${awaiting}`)
      } else {
        titles.push(`${formatInterval(report.episodes)} every week in ${awaiting}`);
      }
    });
  }

  return (
    <div className="trakt-report-item">
      <div>
        <a className="title" href={`https://trakt.tv/shows/${showId}`} target="_blank">
          {show}
        </a>
      </div>
      <span>{titles.join(', ')}</span>
    </div>
  );
};
