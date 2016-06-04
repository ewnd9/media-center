import React from 'react';
import { Router, Route, IndexRedirect, Redirect, browserHistory } from 'react-router';

// used in /frontend/components/right-panel/right-panel.js
export default ({ shell, defaultRoute, routes, notFoundComponent }) => (
  <Router history={browserHistory}>
    <Route path="/" component={shell}>
      <IndexRedirect to={defaultRoute} />

      { routes
          .map(route => {
            return React.createElement(
              Route,
              {
                key: route.url,
                path: route.url,
                component: route.component
              },
              route.children
            );
          })
      }

      <Redirect from="*" to={notFoundComponent} />
    </Route>
  </Router>
);
