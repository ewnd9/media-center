import React from 'react';

export default ({ report, show }) => {
  const titles = [];

  let showId;

  if (report.aired.length > 0) {
    showId = report.aired[0].show.ids.slug;
    titles.push(`${report.aired.length} episodes available`);
  }

  if (report.future.length > 0) {
    showId = report.future[0].episodes[0].show.ids.slug;

    report.future.forEach(report => {
      const length = report.episodes.length;
      if (length === 1) {
        titles.push(`1 episode in ${report.gap} days`)
      } else {
        titles.push(`${length} episodes every week in ${report.gap} days`);
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
