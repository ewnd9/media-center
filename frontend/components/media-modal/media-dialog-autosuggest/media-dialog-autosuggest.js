import React from 'react';
import styles from './style.css';

import * as api from '../../../api';
import Autosuggest from 'react-autosuggest';
import { debounce } from 'lodash';

function getSuggestionValue(suggestion) {
  return suggestion.label;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.label}</span>
  );
}

const MediaDialogAutosuggest = React.createClass({
  getInitialState() {
    return {
      value: '',
      valid: false,
      suggestions: [],
      isLoading: false
    };
  },
  componentDidMount: function() {
    this.autosuggest.input.focus();

    this.loadSuggestions = debounce(value => {
      this.setState({
        isLoading: true
      });

      api.getMediaSuggestion(value, this.props.type)
        .then(suggestions => {
          if (value === this.state.value) {
            this.setState({
              isLoading: false,
              suggestions
            });
            this.autosuggest.input.focus();
          } else {
            this.setState({
              isLoading: false
            });
          }
        }, err => {
          this.setState({
            isLoading: false,
            suggestions: []
          });

          throw err;
        });
    }).bind(this);

    if (this.props.recognition) {
      this.setState({ value: this.props.recognition.title });
      this.loadSuggestions(this.props.recognition.title);
    }
  },
  onChange(event, { newValue }) {
    this.setState({
      value: newValue
    });
  },
  onSuggestionSelected(event, { suggestion, suggestionValue }) {
    this.loadSuggestions(suggestionValue);

    this.setState({ valid: true });
    this.props.updateImdb(suggestion.value, suggestion.label);
  },
  onSuggestionsUpdateRequested({ value, reason }) {
    if (reason !== 'click') {
      this.setState({ valid: false });
    }
    this.loadSuggestions(value);
  },
  render() {
    const { value, suggestions } = this.state;

    const inputProps = {
      placeholder: "Type 'c'",
      value,
      onChange: this.onChange
    };

    const theme = {
      container: styles.container,
      containerOpen: styles.containerOpen,
      input: `${styles.input} ${this.state.valid ? styles.hasSuccess : styles.hasError}`,
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
