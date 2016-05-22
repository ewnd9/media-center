import React from 'react';
import styles from './style.css';
import themeStyles from '../theme.css';

import { getPosterUrl } from '../../api';

export default React.createClass({
  toggleHidden: function() {
    this.props.setActive(this.props.file);
  },
  render: function() {
    const {
      file,
      rightToLeft
    } = this.props;

    const { imdb, s, type } = file;

    return (
      <div
        onClick={this.toggleHidden}
        className={`${styles.poster} ${rightToLeft && themeStyles.textAlignRight || ''}`}>

        <img src={getPosterUrl(type, imdb, s)} className={styles.img} />
      </div>
    );
  }
});
