import React from 'react';
import styles from './style.css';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';
import { debounce } from 'lodash';

import Autosuggest from 'react-autosuggest';
import { schema } from '../../../reducers/movies-reducer';

import moment from 'moment';

function getSuggestionValue(movie) {
  return movie.imdb;
}

function renderSuggestion(movie) {
  const date = moment(movie.releaseDate);
  const body = `${movie.title} ${date.format('MM.DD.YYYY')} (${date.fromNow()})`;

  return (
    <span>
      <span
        className={`glyphicon glyphicon-film`}
        aria-hidden="true" />
      {' '}
      {body}
    </span>
  );
}

const Form = React.createClass({
  propTypes: propTypes({
    fetchSuggestions: t.Function,
    updateSuggestionQuery: t.Function,
    updateMovie: t.Function,
    isDvdReleaseFetching: t.Boolean,

    suggestions: schema.meta.props.suggestions,
    suggestionSearchTitle: schema.meta.props.suggestionSearchTitle
  }),
  componentDidMount() {
    const { fetchSuggestions } = this.props;

    this.autosuggest.input.focus();
    this.loadSuggestions = debounce(fetchSuggestions, 1000);
  },
  onChange(event, { method, newValue }) {
    const { updateSuggestionQuery } = this.props;

    if (method !== 'click') {
      updateSuggestionQuery(newValue);
      this.loadSuggestions(newValue);
    }
  },
  onSuggestionSelected(event, { suggestion: movie }) {
    const { updateMovie, updateSuggestionQuery } = this.props;

    updateMovie(movie.imdb, movie.releaseDate);
    updateSuggestionQuery('');
  },
  onSuggestionsUpdateRequested({ value, reason }) {
    if (reason !== 'click') {
      this.loadSuggestions(value);
    }
  },
  render() {
    const {
      suggestions,
      suggestionSearchTitle,
      isDvdReleaseFetching
    } = this.props;

    const inputProps = {
      placeholder: "Enter Title",
      value: suggestionSearchTitle || '',
      onChange: this.onChange
    };

    const theme = {
      containerOpen: styles.containerOpen,
      input: `${styles.input} ${isDvdReleaseFetching ? styles.loading : ''}`,
      suggestionsContainer: styles.suggestionsContainer,
      suggestion: styles.suggestion,
      suggestionFocused: styles.suggestionFocused
    };

    return (
      <div className={styles.container}>
        <Autosuggest
          ref={i => this.autosuggest = i}
          theme={theme}
          suggestions={suggestions}
          onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps} />
      </div>
    );
  }
});

export default Form;
