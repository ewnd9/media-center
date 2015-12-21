var path = require('path');
var webpack = require('webpack');

var NODE_ENV = process.env.NODE_ENV || 'development';

var plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify(NODE_ENV)
    }
  })
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  );
}

module.exports = {
  entry: {
    app: './frontend/app.js',
    html: './frontend/index.html'
  },
  devtool: 'cheap-module-source-map',
  output: {
    filename: '[name].bundle.js',
    sourceMapFilename: '[file].map',
    path: './public'
  },
  resolve: {
    root: [
      path.join(__dirname, 'frontend'),
      path.join(__dirname, 'node_modules'),
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
        loader: "file?name=[name].[ext]",
      },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  },
  plugins: plugins,
  devServer: {
    contentBase: "./public",
    noInfo: true, //  --no-info option
    hot: false,
    inline: true
  }
};
