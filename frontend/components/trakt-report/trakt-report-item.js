import React from 'react';
import styles from './style.css';

import moment from 'moment';
import { formatEpisode as format } from 'show-episode-format';

import { getPosterUrl } from '../../api';

export default ({ report, show }) => {
  const titles = [];

  const formatInterval = eps =>
    `${format(eps[0].episode)} - ${format(eps[eps.length - 1].episode)} (${eps.length})`;

  let showIds;

  if (report.aired.length > 0) {
    showIds = report.aired[0].show.ids;
    titles.push(`${formatInterval(report.aired)} available`);
  }

  const now = new Date();

  if (report.future.length > 0) {
    showIds = report.future[0].episodes[0].show.ids;

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
  }


  return (
    <div className={styles.marginBottom}>
      <div className={styles.marginBottom}>
        <div className={styles.imgWrapper}>
          <img src={getPosterUrl('show', showIds.imdb)} className={styles.img} />
        </div>
        <a href={`https://trakt.tv/shows/${showIds.slug}`} target="_blank">
          {show}
        </a>
      </div>
      <span>{titles.join(', ')}</span>
    </div>
  );
};
