import React from 'react';
import styles from './style.css';

import { getPosterPlaceholderUrl } from '../../../api';
import ImgGrow from '../../ui/img-grow/img-grow';

export default React.createClass({
  render() {
    const { file: { title, s, type, posterUrl, key }, setActiveKey } = this.props;

    return (
      <div
        onClick={setActiveKey.bind(null, key)}
        className={`${styles.poster}`}>

        <div className={styles.imgWrapper}>
          <ImgGrow src={getPosterPlaceholderUrl()} className={styles.placeholderImg} />
          <ImgGrow src={posterUrl} className={styles.img} />
        </div>

        <div className={styles.summary}>{(type === 'show' ? `S${s > 10 ? s : '0' + s}` : '') + ' ' + title}</div>
      </div>
    );
  }
});
