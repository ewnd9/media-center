import React from 'react';
import styles from './style.css';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import { reactRouterPropTypes } from '../../schema/react-router';
import MoviesList from '../movies-list/movies-list';

import { Link } from 'react-router';

const MoviesListContainer = React.createClass({
  propTypes: propTypes({
    ...reactRouterPropTypes,
    children: t.ReactNode
  }),
  render() {
    const { params, location: { pathname }, children } = this.props;

    if (Object.keys(params).length > 0) {
      return children;
    }

    const type = pathname.split('/').pop();

    return (
      <div>
        <div>
          <Link to="/movies/upcoming" activeClassName={styles.active}>Upcoming</Link>
          {' '}
          <Link to="/movies/recommendations" activeClassName={styles.active}>Recommendations</Link>
        </div>

        <div className={styles.content}>
          <MoviesList type={type} />
        </div>
      </div>
    );
  }
});

export default MoviesListContainer;
