require('babel-polyfill');
require('bootstrap/dist/css/bootstrap.min.css');
require('react-select/dist/react-select.css');
require('./style.css');

import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/main';
import notify from './notify';

ReactDOM.render(<Main />, document.getElementById('root'));

window.onerror = (msg, url, line, col, err) => {
  notify.error(err.stack.split('\n').join('<br />'));
  return true;
};
window.addEventListener('unhandledrejection', event => {
  notify.error(event.detail.reason.stack.split('\n').join('<br />'));
});
