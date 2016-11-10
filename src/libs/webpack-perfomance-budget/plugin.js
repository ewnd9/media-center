/**
 * forked from `webpack-stats-plugin/lib/stats-writer-plugin.js`
 */
function StatsWriterPlugin(opts) {
  opts = opts || {};
  this.opts = {};
  this.opts.filename = opts.filename || 'stats.json';
}

StatsWriterPlugin.prototype = {
  constructor: StatsWriterPlugin,

  apply: function (compiler) {
    const self = this;
    compiler.plugin('emit', function (curCompiler, callback) {
      const stats = curCompiler.getStats().toJson();
      const fs = require('fs'); // lazy
      fs.writeFile(self.opts.filename, JSON.stringify(stats), callback);
    });
  }
};

module.exports = StatsWriterPlugin;
