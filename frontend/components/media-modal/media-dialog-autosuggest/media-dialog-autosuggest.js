import React from 'react';
import styles from './style.css';

import Autosuggest from 'react-autosuggest';
import { debounce } from 'lodash';
import { t, propTypes } from 'tcomb-react';
import { schema } from '../schema';

function getSuggestionValue(suggestion) {
  return suggestion.label;
}

function renderSuggestion(suggestion) {
  return (
    <span>
      <span
        className={`glyphicon glyphicon-film`}
        aria-hidden="true" />
      {' '}
      {suggestion.label}
    </span>
  );
}

const MediaDialogAutosuggest = React.createClass({
  propTypes: propTypes({
    recognition: t.struct({
      imdb: t.maybe(t.String),
      type: t.String,
      s: t.maybe(t.Number),
      ep: t.maybe(t.Number)
    }),
    type: t.String,
    modal: schema,

    selectSuggestion: t.Function,
    fetchSuggestions: t.Function,
  }),
  componentDidMount: function() {
    const {
      recognition,
      fetchSuggestions
    } = this.props;

    this.autosuggest.input.focus();
    this.loadSuggestions = debounce(value => {
      const { type } = this.props;
      return fetchSuggestions(type, value).then(() => this.autosuggest.input.focus());
    });

    if (recognition) {
      const { title } = recognition;
      this.loadSuggestions(title);
    }
  },
  onChange(event, { method, newValue }) {
    if (method !== 'click') {
      this.loadSuggestions(newValue);
    }
  },
  onSuggestionSelected(event, { suggestion }) {
    const { selectSuggestion } = this.props;
    selectSuggestion(suggestion.value, suggestion.label);
  },
  onSuggestionsUpdateRequested({ value, reason }) {
    if (reason !== 'click') {
      this.loadSuggestions(value);
    }
  },
  render() {
    const {
      modal: {
        suggestions,
        suggestionSearchTitle,
        suggestionIsValid,
        isFetching
      }
    } = this.props;

    const inputProps = {
      placeholder: "Type 'c'",
      value: suggestionSearchTitle || '',
      onChange: this.onChange
    };

    const theme = {
      container: styles.container,
      containerOpen: styles.containerOpen,
      input: `${styles.input} ${isFetching ? styles.loading : ''} ${suggestionIsValid ? styles.hasSuccess : styles.hasError}`,
      suggestionsContainer: styles.suggestionsContainer,
      suggestion: styles.suggestion,
      suggestionFocused: styles.suggestionFocused
    };

    return (
      <div>
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

export default MediaDialogAutosuggest;
