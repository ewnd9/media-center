const fs = require('fs');
const mkdirp = require('mkdirp');

const root = process.argv[2];
const dest = process.argv[3];

if (!root || !dest) {
  throw new Error('argv');
}

// @TODO clone attributes (birthtime)

function clone(dir) {
  fs.readdirSync(root + dir).forEach(file => {
    const path = root + dir + file;
    console.log(path);

    if (fs.statSync(path).isDirectory()) {
      mkdirp(dest + dir + file);
      clone(dir + file + '/');
    } else {
      fs.writeFileSync(dest + dir + file, '', 'utf-8');
    }
  });
};

clone('/');
