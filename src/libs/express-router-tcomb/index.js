import express from 'express';
import methods from 'methods';
import tcombMiddleware, { createTcombMiddleware } from './middleware';

export { tcombMiddleware, createTcombMiddleware };

export default () => {
  const data = [];

  const router = methods.reduce(
    (total, method) => {
      total[method] = function({ path, schema = {}, handler, middleware = [] }) {
        route({ method, path, schema, handler, middleware });
      };

      return total;
    },
    {
      route,
      getRouter() {
        const router = express.Router();

        data.forEach(route => {
          router[route.method].apply(router, [route.path].concat(route.arguments));
        });

        router._routerTcomb = this;
        return router;
      },
      findRoute(method, path) {
        return data.find(route => route.method === method && route.path === path);
      }
    }
  );

  function route({ method, path, schema, handler, middleware = [] }) {
    data.push({
      path,
      method: method.toLowerCase(),
      schema,
      arguments: [tcombMiddleware(schema)].concat(middleware).concat(handler)
    });
  }

  return router;
};
