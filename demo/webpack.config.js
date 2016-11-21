'use strict';

const path = require('path');
const config = require('../webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

config.entry.app = path.resolve(__dirname, 'index.js');
config.output.path = path.resolve(__dirname, 'public', 'media-center');

config.plugins = config.plugins.reduce((total, plugin) => {
  if (plugin instanceof HtmlWebpackPlugin) {
    total.push(new HtmlWebpackPlugin({
      filename: 'frontend.html',
      template: path.resolve(__dirname, '..', 'frontend', 'index.html'),
      favicon: path.resolve(__dirname, '..', 'frontend', 'assets', 'favicon.ico'),
      inject: 'body'
    }));
    total.push(new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      favicon: path.resolve(__dirname, '..', 'frontend', 'assets', 'favicon.ico'),
      inject: false
    }));
  } else {
    total.push(plugin);
  }

  return total;
}, []);

module.exports = config;
