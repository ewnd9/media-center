import React from 'react';
import * as api from './../api';
import Select from 'react-select';
import Autocomplete from 'react-autocomplete';

export default React.createClass({
  getInitialState: function() {
    if (this.props.file.recognition) {
      const r = this.props.file.recognition;

      return {
        imdb: [r.title],
        type: [r.type],
        s: r.s,
        ep: r.ep
      };
    } else {
      return {
        imdb: [],
        type: ['show', 'movie']
      };
    }
  },
  getSelectOptions: function(input) {
    return api.getMediaSuggestion(input, 'show');
  },
  componentWillReceiveProps: function(props) {
  },
  onChangeInput: function(field, event) {
    this.setState({ [field]: event.target.value });
  },
  handleSubmit: function(event) {
    event.preventDefault();

    api.playFile(this.props.file.file, {
      type: this.state.type[0],
      imdb: this.state.imdb[0].value,
      s: this.state.s,
      ep: this.state.ep
    });
  },
  render: function() {
    return (
			<div className="MediaDialog">
				<h2>{this.props.file.filename}</h2>
				<form onSubmit={this.handleSubmit}>
          <div className="field-group">
            <Autocomplete
              ref="autocomplete"
              items={this.state.type}
              getItemValue={(item) => item}
              onSelect={(value, item) => {
                this.setState({ type: [ item ] })
              }}
              renderItem={(item, isHighlighted) => (
                <div
                  key={item}
                  id={item}
                >{item}</div>
              )} />
          </div>

          <div className="field-group">
            <Autocomplete
              ref="imdbAutocomplete"
              items={this.state.imdb}
              getItemValue={(item) => item.label}
              onSelect={(value, item) => {
                this.setState({ imdb: [ item ] })
              }}
              onChange={(event, value) => {
                this.getSelectOptions(value).then((data) => {
                  this.setState({ imdb: data });
                });
              }}
              renderItem={(item, isHighlighted) => (
                <div
                  key={item.value}
                  id={item.value}
                >{item.label}</div>
              )} />
          </div>

          <div className="field-group">
            <input name="s" placeholder="Season" value={this.state.s} onChange={this.onChangeInput.bind(this, 's')} />
          </div>

          <div className="field-group">
            <input name="ep" placeholder="Episode" value={this.state.ep} onChange={this.onChangeInput.bind(this, 'ep')} />
          </div>

					<div className="field-group">
            <button>Submit</button>
            <button onClick={this.props.closeModal}>Close</button>
					</div>
				</form>
			</div>
    );
	}
});
