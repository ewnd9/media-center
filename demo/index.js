'use strict';

import AppInjector from 'inject!../frontend/app';
import * as RouterMock from 'react-router';
import * as api from '../frontend/api';

const SocketMock = function(url) {
  return {
    on: () => {}
  }
};

const ApiMock = Object.keys(api).reduce((total, fnName) => {
  total[fnName] = () => Promise.reject(new Error(`${fnName} not mocked`));
  return total;
}, {});

ApiMock.getBaseUrl = () => '/';
// ApiMock.getReport = () => Promise.resolve(require('!!json!./__fixtures__/trakt-report.json'));
// ApiMock.findFiles = () => Promise.resolve(require('!!json!./__fixtures__/files.json'));
ApiMock.getReport = () => Promise.resolve({ report: [] });
ApiMock.findFiles = () => Promise.resolve([]);

RouterMock.browserHistory = RouterMock.createMemoryHistory();

AppInjector({
  'socket.io-client/socket.io': SocketMock,
  './api': ApiMock,
  'react-router': RouterMock
});
