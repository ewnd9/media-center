import React from 'react';
import Spinner from 'react-spinkit';

const style = {
  display: 'inline-block',
  height: 10
};

const spinnerStyle = {
  height: 'inherit'
};

export default () => (
  <span style={style}>
    <Spinner spinnerName="wave" noFadeIn style={spinnerStyle} />
  </span>
);
