import { agent } from 'supertest';
import { getError } from 'tcomb-pretty-match';

import methods from 'methods';

export default function Agent(app, server) {
  if (!(this instanceof Agent)) {
    return new Agent(app, server);
  }

  this.app = app;
  this.agent = agent(server);
}

methods.forEach(method => {
  Agent.prototype[method] = function(path, { query, params = {}, body } = {}) {
    const route = findRoute(this.app, method, path);

    if (!route) {
      throw new Error(`Can't find route (${method.toUpperCase()} ${path})`);
    }

    const schema = route.schema;

    if (!schema.response) {
      return Promise.reject(new Error(`No Response Schema (${method.toUpperCase()} ${path})`));
    }

    const url = Object.keys(params).reduce(
      (path, paramName) => path.replace(`:${paramName}`, encodeURIComponent(params[paramName])),
      path
    );

    let req = this.agent[method].call(this.agent, url);

    if (query) {
      req = req.query(query);
    }

    if (body) {
      req = req.send(body);
    }

    return promisify(req)
      .then(res => {
        const error = getError(res.body, schema.response, { strict: true });

        if (error) {
          return Promise.reject(new Error(`Response Body Validation Error (${method.toUpperCase()} ${url}):\n${error}`));
        }

        return res;
      });

    function promisify(req) {
      return new Promise((resolve, reject) => {
        req.end((error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        });
      });
    }
  };
});


export function findRoute(app, method, path) {
  return findRouteRec(app._router.stack, method, path);
}

function findRouteRec(root, method, path) {
  for (const el of root) {
    if (el.handle && el.handle.stack) {
      if (el.handle._routerTcomb) {
        const result = el.handle._routerTcomb.findRoute(method, path);

        if (result) {
          return result;
        }
      }

      const result = findRouteRec(el.handle.stack, method, path);

      if (result) {
        return result;
      }
    }
  }
}
