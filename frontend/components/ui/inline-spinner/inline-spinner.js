import React from 'react';
import Spinner from 'react-spinkit';

const style = {
  display: 'inline-block',
  height: 10,
  textAlign: 'center'
};

const spinnerStyle = {
  width: 'inherit',
  height: 'inherit'
};

export default () => (
  <span style={style}>
    <Spinner spinnerName="wave" noFadeIn style={spinnerStyle} />
  </span>
);
