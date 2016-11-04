import React from 'react';

import { connect } from 'react-redux';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import { fetchPerson } from '../../actions/persons-actions';

const mapStateToProps = ({ persons }) => ({ persons });
const mapDispatchToProps = { fetchPerson };

import { schema } from '../../reducers/persons-reducer';
import { reactRouterPropTypes } from '../../schema/react-router';

import Spinner from '../ui/spinner/spinner';
import Media from '../ui/media/media';

import * as api from '../../api';

const Person = React.createClass({
  propTypes: propTypes({
    ...reactRouterPropTypes,
    persons: schema,
    children: t.Nil,

    fetchPerson: t.Function
  }),
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  componentDidMount() {
    const { routeParams: { tmdb, imdb }, fetchPerson } = this.props;
    fetchPerson(tmdb, imdb);
  },
  componentWillReceiveProps(nextProps) {
    const { routeParams, fetchPerson } = this.props;

    if (routeParams.tmdb && nextProps.persons.person) {
      this.context.router.push(`/persons/${nextProps.persons.person.imdb}`);
    } else if (nextProps.routeParams.imdb && routeParams.imdb !== nextProps.routeParams.imdb) {
      fetchPerson(null, nextProps.routeParams.imdb);
    }
  },
  render() {
    const { persons: { person } } = this.props;

    if (!person) {
      return <Spinner />;
    }

    return (
      <Media
        posterUrl={api.getTmdbPosterUrl(person.tmdbData.profile_path)}
        title={person.name}
        tagline={''}
        fields={[
          // { field: 'DVD Release Date', value: date },
          // { field: 'Overview', value: movie.tmdbData.overview }
        ]}
        movies={person.tmdbData.movie_credits}
        tv={person.tmdbData.tv_credits} />
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Person);
