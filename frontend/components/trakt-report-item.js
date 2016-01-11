import React from 'react';

export default ({ report, show }) => {
  const titles = [];

  if (report.aired.length > 0) {
    titles.push(`${report.aired.length} episodes available`);
  }

  if (report.future.length > 0) {
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
      <div>{show}</div>
      <span>{titles.join(', ')}</span>
    </div>
  );
};
