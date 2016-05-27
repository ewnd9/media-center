import 'babel-polyfill';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-select/dist/react-select.css';
import './style.css';

import notify from './notify';

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

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Main from './components/main/main';
import configureStore from './configure-store';

const store = configureStore();

const app = (
  <Provider store={store}>
    <Main />
  </Provider>
);

ReactDOM.render(app, document.getElementById('root'));
