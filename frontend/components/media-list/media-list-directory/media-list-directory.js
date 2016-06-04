import React from 'react';
import styles from './style.css';

import { getPosterUrl, getPosterPlaceholderUrl } from '../../../api';

export default React.createClass({
  toggleHidden: function() {
    this.props.setActive(this.props.file);
  },
  render: function() {
    const { file } = this.props;
    const { title, imdb, s, type } = file;

    return (
      <div
        onClick={this.toggleHidden}
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
