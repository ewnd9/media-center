import React from 'react';
import { Router, Route, IndexRedirect, Redirect, browserHistory } from 'react-router';

export default ({ shell, defaultRoute, routes, notFoundComponent }) => (
  <Router history={browserHistory}>
    <Route path="/" component={shell}>
      <IndexRedirect to={defaultRoute} />

      { routes
          .map(route => {
            return (
              <Route path={route.url} key={route.url} component={route.component} />
            );
          })
      }

      <Redirect from="*" to={notFoundComponent} />
    </Route>
  </Router>
);
