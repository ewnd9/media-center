import React from 'react';
import styles from './style.css';

import { getPosterUrl, getPosterPlaceholderUrl } from '../../../api';

export default React.createClass({
  render() {
    const { file: { title, imdb, s, type, key }, setActiveKey } = this.props;

    return (
      <div
        onClick={setActiveKey.bind(null, key)}
        className={`${styles.poster}`}>

        <div className={styles.imgWrapper}>
          <img src={getPosterPlaceholderUrl()} className={styles.placeholderImg} />
          <img src={getPosterUrl(type, imdb, s)} className={styles.img} />
        </div>

        <div className={styles.summary}>{(type === 'show' ? `S${s > 10 ? s : '0' + s}` : '') + ' ' + title}</div>
      </div>
    );
  }
});
