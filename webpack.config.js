'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const cwd = process.cwd();

const config = {
  entry: {
    app: path.join(cwd, 'frontend/app.js'),
    vendors: []
  },
  devtool: 'cheap-module-source-map',
  output: {
    filename: '[name].bundle.js',
    sourceMapFilename: '[file].map',
    path: path.join(cwd, 'public'),
    publicPath: '/'
  },
  resolve: {
    root: [
      path.join(cwd, 'src'),
      path.join(cwd, 'node_modules'),
    ],
    moduleDirectories: [
      'node_modules'
    ]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.css$/,
        exclude: /components/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.css$/,
        include: /components/,
        loader: 'style-loader!css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
      },
      { test: /\.(png|jpg|gif|json)$/, loader: 'url-loader?limit=100000' },
      { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' }
    ]
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(cwd, 'frontend/index.html'),
      favicon: path.join(cwd, 'frontend/assets/favicon.ico'),
      inject: 'body'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        ERROR_BOARD_URL: JSON.stringify(process.env.ERROR_BOARD_URL),
        APP_ENV: JSON.stringify('browser'),
        MC_DEMO: JSON.stringify(process.env.MC_DEMO || false)
      },
    }),
    new webpack.ContextReplacementPlugin(/node_modules\/moment\/locale/, /en/)
  ],
  postcss: function(webpack) {
    return [
      require('postcss-import')({
        addDependencyTo: webpack
      }),
      require('postcss-cssnext')
    ];
  },
  devServer: {
    contentBase: path.join(cwd, 'dist'),
    noInfo: true,
    hot: true,
    inline: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000'
      },
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
};

module.exports = config;
