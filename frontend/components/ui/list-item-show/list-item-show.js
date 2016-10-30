import React from 'react';
import styles from './style.css';

export default React.createClass({
  render() {
    const { posterUrl, title, body, badge } = this.props;

    return (
      <div className={`${styles.container}`}>
        <div className={styles.imgWrapper}>
          <img
            src={posterUrl}
            className={styles.img} />
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.title}>
            {title}
            {' '}
            {badge && <span className={styles.badge}>({badge})</span> || null}
          </div>
          <div className={styles.body}>{Array.isArray(body) ? body.map((body, index) => <div key={index}>{body}</div>) : body}</div>
        </div>

      </div>
    );
  }
});
