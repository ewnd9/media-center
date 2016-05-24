require('babel-polyfill');
require('bootstrap/dist/css/bootstrap.min.css');
require('react-select/dist/react-select.css');
require('./style.css');

import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/main/main';
import notify from './notify';

ReactDOM.render(<Main />, document.getElementById('root'));

window.onerror = (msg, url, line, col, err) => {
  logError(err);
  return true;
};
window.addEventListener('unhandledrejection', reason => {
  logError(reason.message || reason);
});

function logError(err) {
  notify.error(err.stack.split('\n').join('<br />'));
  console.error(err.stack || err);
}
