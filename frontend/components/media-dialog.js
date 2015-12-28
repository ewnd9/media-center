import React from 'react';
import * as api from './../api';
import Select from 'react-select';
import Autocomplete from 'react-autocomplete';

export default React.createClass({
  getInitialState: function() {
    if (this.props.file.recognition) {
      const r = this.props.file.recognition;

      return {
        imdb: r.title,
        title: r.title,
        type: r.type,
        s: r.s,
        ep: r.ep,
        initType: r.type,
        initImdb: r.title
      };
    } else {
      return {
        imdb: [],
        type: 'show'
      };
    }
  },
  getSelectOptions: function(input) {
    return api.getMediaSuggestion(input || this.state.title, this.state.type)
      .then(options => {
        let i = 0;

        options.forEach(item => {
          item.value = item.value || i++;
        });

        return { options };
      }, err => ({ options: [] }));
  },
  componentWillReceiveProps: function(props) {
  },
  onChangeInput: function(field, event) {
    const value = typeof event === 'object' ? event.target.value : event;
    this.setState({ [field]: value });
  },
  handleSubmit: function(event) {
    event.preventDefault();

    api.playFile(this.props.file.file, {
      type: this.state.type,
      imdb: document.querySelector('input[name="imdb"]').value,
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
            <Select
              name="type"
              value={this.state.initType}
              options={[{ value: 'show', label: 'show'}, { value: 'movie', label: 'movie' }]}
              onChange={this.onChangeInput.bind(this, 'type')}
            />
          </div>

          <div className="field-group">
            <Select
              name="imdb"
              value={this.state.title}
              asyncOptions={this.getSelectOptions}
            />
          </div>

          {
            this.state.type === 'show' && (
              <div className="field-group">
                <input name="s" placeholder="Season" value={this.state.s} onChange={this.onChangeInput.bind(this, 's')} />
              </div>
            )
          }

          {
            this.state.type === 'show' && (
              <div className="field-group">
                <input name="ep" placeholder="Episode" value={this.state.ep} onChange={this.onChangeInput.bind(this, 'ep')} />
              </div>
            )
          }

					<div className="field-group">
            <button>Submit</button>
            <button onClick={this.props.closeModal}>Close</button>
					</div>
				</form>
			</div>
    );
	}
});
