import React from 'react';

import { connect } from 'react-redux';
import moment from 'moment';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';
import { reactRouterPropTypes } from '../../schema/react-router';

import { fetchMovie } from '../../actions/movies-actions';
import { schema } from '../../reducers/movies-reducer';

import Spinner from '../ui/spinner/spinner';
import Media from '../ui/media/media';

const mapStateToProps = ({ movies }) => ({ movies });
const mapDispatchToProps = { fetchMovie };

const Movie = React.createClass({
  propTypes: propTypes({
    ...reactRouterPropTypes,
    children: t.Nil,
    movies: schema,
    fetchMovie: t.Function
  }),
  componentDidMount() {
    const { routeParams: { imdb }, fetchMovie } = this.props;
    fetchMovie(imdb);
  },
  render() {
    const { movies: { movie } } = this.props;

    if (!movie) {
      return (<Spinner />);
    }

    const date = moment(movie.releaseDate).format('MM.DD.YYYY');

    return (
      <Media
        posterUrl={movie.posterUrl}
        title={movie.title}
        tagline={movie.tmdbData.tagline}
        fields={[
          { field: 'DVD Release Date', value: date },
          { field: 'Overview', value: movie.tmdbData.overview }
        ]}
        credits={movie.tmdbData.credits} />
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Movie);
