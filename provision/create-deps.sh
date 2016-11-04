#!/bin/sh

node -e "require('fs').writeFileSync('./deps.json', JSON.stringify({ dependencies: require('./package.json').dependencies }, null, 2))"
