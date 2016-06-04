'use strict';

const fs = require('fs');
const _ = require('lodash');
const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');

if (!module.parent) {
  const content = formatFiles(readJSON(), './public');
  updateMarkdown('./README.md', content);
  console.log(content);
}

exports.formatFiles = formatFiles;
exports.updateMarkdown = updateMarkdown;

function updateMarkdown(fileName, lines) {
  const readme = fs.readFileSync(fileName, 'utf-8');
  fs.writeFileSync(fileName, replaceBetween(readme, '## Filesize report', '## Credits', lines), 'utf-8');
}

function readJSON() {
  return JSON.parse(fs.readFileSync('./stats.json', 'utf-8')).assets;
}

function formatFiles(files, distDirectory) {
  const assets = files
    .map(asset => {
      const parts = asset.name.split('.');
      asset.ext = parts[parts.length - 1];

      return asset;
    });

  const groups = _.groupBy(assets, 'ext');
  const formatGroup = group => {
    let result = `- ${group}\n`;

    groups[group].forEach(asset => {
      const name = asset.name.replace(/[\w\d]{20,}\./, '');
      const file = fs.readFileSync(`${distDirectory}/${asset.name}`);
      const size = prettyBytes(asset.size);
      const gzip = prettyBytes(gzipSize.sync(file));

      result += `  - ${name} ${gzip} gziped\n`;
    });

    return result;
  };

  return '\n' + ['html', 'css', 'js'].map(formatGroup).join('\n');
}

function replaceBetween(input, before, after, replacement) {
  return input.replace(new RegExp(`${before}$([\\s\\S]*)^${after}`, 'm'), `${before}\n${replacement}\n${after}`);
}
