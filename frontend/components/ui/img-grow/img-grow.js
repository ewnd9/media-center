import React from 'react';
import styles from './style.css';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

const ImgGrow = React.createClass({
  propTypes: propTypes({
    className: t.String,
    src: t.String
  }),
  render() {
    const { src, className } = this.props;

    return (
      <div
        className={`${styles.img2} grow ${className}`}
        style={{ backgroundImage: `url(${src})` }} />
    );
  }
});

export default ImgGrow;
