'use strict';

const fs = require('fs');
const prettyBytes = require('pretty-bytes');

const data = JSON.parse(fs.readFileSync('./stats.json', 'utf-8'));
const assets = data.assets
  .map(asset => {
    const parts = asset.name.split('.');
    asset.ext = parts[parts.length - 1];

    return asset;
  });

const _ = require('lodash');
const groups = _.groupBy(assets, 'ext');
const formatGroup = group => {
  let result = `- ${group}\n`;

  groups[group].forEach(asset => {
    result += `  - ${asset.name} ${prettyBytes(asset.size)}\n`;
  });

  return result;
};

const lines = '\n' + ['html', 'css', 'js'].map(formatGroup).join('\n');

const fileName = './README.md'
const readme = fs.readFileSync(fileName, 'utf-8');
fs.writeFileSync(fileName, replaceBetween(readme, '## Filesize report', '## Credits'), 'utf-8');

console.log(lines);

function replaceBetween(input, before, after, replacement) {
  return readme.replace(new RegExp(`${before}$([\\s\\S]*)^${after}`, 'm'), `${before}\n${lines}\n${after}`);
}
