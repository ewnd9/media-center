import React from 'react';
import styles from './style.css';

import { getPosterUrl } from '../../../api';

export default React.createClass({
  render() {
    const { type, imdb, title, body } = this.props;

    return (
      <div className={`${styles.marginBottom} clearfix`}>
        <div className={styles.imgWrapper}>
          <img
            src={getPosterUrl(type, imdb)}
            className={styles.img} />
        </div>

        <div>
          <div className={styles.title}>{ title }</div>
          <div className={styles.body}>{ body }</div>
        </div>

      </div>
    );
  }
});
