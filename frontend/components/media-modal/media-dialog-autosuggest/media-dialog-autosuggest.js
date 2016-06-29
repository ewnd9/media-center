import React from 'react';
import styles from './style.css';

import Autosuggest from 'react-autosuggest';
import { debounce } from 'lodash';
import { t, propTypes } from 'tcomb-react';

function getSuggestionValue(suggestion) {
  return suggestion.label;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.label}</span>
  );
}

const MediaDialogAutosuggest = React.createClass({
  propTypes: propTypes({
    type: t.String,
    isFetching: t.Boolean,
    suggestions: t.Array,
    suggestionSearchTitle: t.String,
    suggestionIsValid: t.Boolean,
    suggestionSelectedValue: t.maybe(t.String),
    suggestionSelectedLabel: t.maybe(t.String),
    selectSuggestion: t.Function,
    fetchSuggestions: t.Function,
    recognition: t.struct({
      imdb: t.maybe(t.String),
      type: t.String,
      s: t.maybe(t.Number),
      ep: t.maybe(t.Number)
    })
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
      suggestions,
      suggestionSearchTitle,
      suggestionIsValid
    } = this.props;

    const inputProps = {
      placeholder: "Type 'c'",
      value: suggestionSearchTitle || '',
      onChange: this.onChange
    };

    const theme = {
      container: styles.container,
      containerOpen: styles.containerOpen,
      input: `${styles.input} ${suggestionIsValid ? styles.hasSuccess : styles.hasError}`,
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
