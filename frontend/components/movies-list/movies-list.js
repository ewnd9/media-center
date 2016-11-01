import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';
import moment from 'moment';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';
import { reactRouterPropTypes } from '../../schema/react-router';

import { Link } from 'react-router';

import {
  fetchMovies,
  fetchSuggestions,
  updateSuggestionQuery,
  updateMovie,
  toggleShowForm
} from '../../actions/movies-actions';

import { schema } from '../../reducers/movies-reducer';
import Form from './form/form';

const mapStateToProps = ({ movies }) => ({ movies });
const mapDispatchToProps = {
  fetchMovies,
  fetchSuggestions,
  updateSuggestionQuery,
  updateMovie,
  toggleShowForm
};

import ListItem from '../ui/list-item-show/list-item-show';

const MoviesList = React.createClass({
  propTypes: propTypes({
    ...reactRouterPropTypes,
    children: t.Nil,
    movies: schema,

    fetchMovies: t.Function,
    fetchSuggestions: t.Function,
    updateSuggestionQuery: t.Function,
    updateMovie: t.Function,
    toggleShowForm: t.Function
  }),
  componentDidMount() {
    const { fetchMovies } = this.props;
    fetchMovies();
  },
  componentWillUnmount() {
    const { toggleShowForm, movies: { showForm } } = this.props;

    if (showForm) {
      toggleShowForm(false);
    }
  },
  render() {
    const {
      fetchSuggestions,
      updateSuggestionQuery,
      updateMovie,
      toggleShowForm,
      movies: {
        movies,
        showForm,
        suggestions,
        suggestionSearchTitle
      }
    } = this.props;

    return (
      <div>
        <div>
          {
            showForm && (
              <div className={styles.formWrapper}>
                <button className={`${styles.textButton} ${styles.closeButton}`} onClick={toggleShowForm.bind(null, !showForm)}>
                  ×
                </button>

                <Form
                  fetchSuggestions={fetchSuggestions}
                  updateSuggestionQuery={updateSuggestionQuery}
                  suggestions={suggestions}
                  suggestionSearchTitle={suggestionSearchTitle}
                  updateMovie={updateMovie} />
              </div>
            ) || (
              <button className={styles.textButton} onClick={toggleShowForm.bind(null, !showForm)}>
                Add New Movie
              </button>
            )
          }
        </div>
        <div className={styles.list}>
          {
            movies.map(movie => {
              const date = moment(movie.releaseDate);
              const body = `${date.format('MM.DD.YYYY')} (${date.fromNow()})`;

              return (
                <ListItem
                  key={movie.imdb}
                  posterUrl={movie.posterUrl}
                  body={body}
                  title={<Link to={`/movies/${movie.imdb}`}>{movie.title}</Link>} />
              );
            })
          }
        </div>
      </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MoviesList);
