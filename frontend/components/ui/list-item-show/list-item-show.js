import React from 'react';
import styles from './style.css';

export default React.createClass({
  render() {
    const { posterUrl, title, body } = this.props;

    return (
      <div className={`${styles.marginBottom} clearfix`}>
        <div className={styles.imgWrapper}>
          <img
            src={posterUrl}
            className={styles.img} />
        </div>

        <div>
          <div className={styles.title}>{title}</div>
          <div className={styles.body}>{body}</div>
        </div>

      </div>
    );
  }
});
