import t from 'tcomb';

export const reactRouterPropTypes = {
  history: t.Object,
  location: t.Object,
  params: t.Object,
  route: t.Object,
  routeParams: t.Object,
  routes: t.Array
};
