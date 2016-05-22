import React from 'react';
import styles from './style.css';
import themeStyles from '../theme.css';

import { getPosterUrl } from '../../api';

export default React.createClass({
  toggleHidden: function() {
    this.props.setActive(this.props.file);
  },
  componentDidMount() {
    setTimeout(() => {
      this.props.setPosition(this.props.file, this.top);
    }, this.props.index * 50); // ¯\_(ツ)_/¯
  },
  setEl(el) {
    if (el) {
      const rect = el.getBoundingClientRect();

      if (this.top !== rect.top) {
        this.top = rect.top;
      }
    }
  },
  render: function() {
    const {
      file,
      rightToLeft
    } = this.props;

    const { imdb, s, type } = file;

    return (
      <div
        ref={el => this.setEl(el)}
        onClick={this.toggleHidden}
        className={`${styles.poster} ${rightToLeft && themeStyles.textAlignRight || ''}`}>

        <img src={getPosterUrl(type, imdb, s)} className={styles.img} />
      </div>
    );
  }
});
