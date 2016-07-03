import 'babel-polyfill';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import '!!file?name=[name].[ext]!./assets/chrome-manifest.json';
require.context('!!file?name=[name].[ext]!./assets/', false, /^\.\/.*\.png$/);

import notify from './notify';
import report from './agent';

if (process.env.NODE_ENV === 'production' && process.env.ERROR_BOARD_URL) {
  window.onerror = (msg, url, line, col, err) => {
    notify.error(err.stack && err.stack.split('\n').join('<br />') || err);
    report(err, { url: window.location.href });

    return true; // stop propagation
  };

  window.addEventListener('unhandledrejection', rejection => {
    const err = rejection.reason;

    notify.error(err.stack && err.stack.split('\n').join('<br />') || err);
    report(err, { url: window.location.href });
  });
}

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Main from './components/main/main';
import configureStore from './configure-store';

import * as api from './api';
import { fetchFiles } from './actions/files-actions';
import { recievePlayback } from './actions/playback-actions';
import {
  UPDATE_PLAYBACK,
  RELOAD_FILES
} from './constants';

/* global io */
require('script!socket.io-client/socket.io.js');
const socket = io(api.getBaseUrl());

const store = configureStore(socket);

const app = (
  <Provider store={store}>
    <Main />
  </Provider>
);

ReactDOM.render(app, document.getElementById('root'));

socket.on(UPDATE_PLAYBACK, playback => store.dispatch(recievePlayback(playback)));
socket.on(RELOAD_FILES, () => store.dispatch(fetchFiles()));
