import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';
import moment from 'moment';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import {
  fetchMovies,
  fetchSuggestions,
  updateSuggestionQuery,
  updateMovie,
  toggleShowForm
} from '../../actions/movies-actions';

import { schema } from '../../reducers/movies-reducer';

import { Link } from 'react-router';
import Form from './form/form';
import Spinner from '../ui/spinner/spinner';

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
    children: t.Nil,
    movies: schema,

    type: t.enums.of(['upcoming', 'recommendations']),

    fetchMovies: t.Function,
    fetchSuggestions: t.Function,
    updateSuggestionQuery: t.Function,
    updateMovie: t.Function,
    toggleShowForm: t.Function
  }),
  componentDidMount() {
    const { fetchMovies, type } = this.props;
    fetchMovies(type);
  },
  componentWillReceiveProps(nextProps) {
    const { fetchMovies, type } = this.props;

    if (type !== nextProps.type) {
      fetchMovies(nextProps.type);
    }
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
      type,
      movies: {
        movies,
        isFetching,
        showForm,
        suggestions,
        suggestionSearchTitle
      }
    } = this.props;

    if (isFetching) {
      return (<Spinner />);
    }

    return (
      <div>
        <div>
          {
            type === 'upcoming' && (
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
            ) || null
          }
        </div>
        <div className={styles.list}>
          {
            movies.map(movie => {
              let body;

              if (movie.releaseDate === 'true') {
                body = 'TBA';
              } else {
                const date = moment(movie.releaseDate);
                body = `${date.format('MM.DD.YYYY')} (${date.fromNow()})`;
              }

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
