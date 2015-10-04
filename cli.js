#!/usr/bin/env node

require('babel/register')({
	ignore: /(node_modules|bower_components)(?!\/pw3)/
});
require('./src/index');
