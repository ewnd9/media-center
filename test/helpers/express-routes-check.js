'use strict';

const lsRoute = require('express-ls-routes');
const chalk = require('chalk');
const globby = require('globby');
const parse = require('babylon').parse;
const traverse = require('babel-core').traverse;

export default (app, testFilter) => {
  const routes = getRoutes(app);
  const tests = getTests(testFilter);

  return routes.reduce((total, route) => {
    const test = tests.find(test => test.indexOf(route) === 0);

    if (!test) {
      total.push(route);
    }

    return total;
  }, []);
}

// if (false) {
//   const createApp = require('../lib/server').default;
//
//   const app = createApp({ services: {}, config: { screenshotPath: '/', port: 3005 } }).app;
//   const routes = getRoutes(app);
//
//   const file = __dirname + '/../test/routers-files-spec.js';
//   const tests = getTests('test/**/*-spec.js');
//
//   console.log();
//
  // const notFoundCount = routes.reduce((total, route) => {
  //   const test = tests.find(test => test.indexOf(route) === 0);
  //
  //   console.log(route + ' ' + (test ? chalk.green('ok') : chalk.red('not-found')));
  //   return total + (test ? 0 : 1);
  // }, 0);
//
//   console.log();
//   console.log(`${chalk.green((routes.length - notFoundCount) + ' have been found')}`);
//
//   if (notFoundCount > 0) {
//     console.log(`${chalk.red(notFoundCount + ' haven\'t been found')}`);
//   }
//
//   console.log();
//   process.exit(notFoundCount ? 1 : 0);
// }

function getRoutes(app) {
  const result = [];

  app._router.stack.forEach(el => {
    if (el.handle.stack) {
      el.handle.stack.forEach(route => {
        if (!route.route) {
          return;
        }
        
        result.push(`${Object.keys(route.route.methods).map(key => key.toUpperCase()).join(' ')} ${route.route.path}`);
      });
    }
  });

  return result;
}

function getTests(filter) {
  return globby
    .sync([filter])
    .reduce((total, file) => {
      try {
        const predicates = [
          isCalleeNameEqual('test'),
          isCalleeObjectEqual('test', 'serial')
        ];

        return total.concat(getExpressionsArguments(file, predicates).map(_ => _[0]));
      } catch (e) {
        throw e;
      }
    }, []);
}

const isCalleeNameEqual = name => callee => callee.name === name;
const isCalleeObjectEqual = (object, property) => callee =>
  callee.object && callee.object.name === object && callee.property.name === property;

function getExpressionsArguments(file, predicates) {
  const code = require('fs').readFileSync(file, 'utf-8');
  const ast = parse(code, { sourceType: 'module', plugins: ['asyncFunctions'] });

  const result = [];

  traverse(ast, {
    ExpressionStatement(path, parent) {
      const node = path.node;

      if (!node.expression.callee) {
        return;
      }

      const callee = node.expression.callee;
      if (predicates.some(p => p(callee))) {
        result.push(node.expression.arguments.map(_ => _.value));
      }
    },
  });

  return result;
}
