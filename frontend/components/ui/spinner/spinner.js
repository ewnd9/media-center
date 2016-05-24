import React from 'react';
import Spinner from 'react-spinkit';

const style = {
  height: '200px',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default () => <Spinner spinnerName="three-bounce" noFadeIn style={style} />;
