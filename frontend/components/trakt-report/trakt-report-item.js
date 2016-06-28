import React from 'react';
import styles from './style.css';

import { getPosterUrl } from '../../api';

export default ({ show, showIds, titles }) => {
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
