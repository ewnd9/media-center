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

export default ({ className }) => (
  <span style={style} className={className}>
    <Spinner spinnerName="wave" noFadeIn style={spinnerStyle} />
  </span>
);
