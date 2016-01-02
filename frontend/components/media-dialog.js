import React from 'react';
import * as api from './../api';
import Select from 'react-select';

export default React.createClass({
  getInitialState: function() {
    if (this.props.file.recognition) {
      const r = this.props.file.recognition;

      return {
        type: {
          label: r.type,
          value: r.type
        },
        s: r.s,
        ep: r.ep
      };
    } else {
      return {
        imdb: [],
        type: 'show'
      };
    }
  },
  getSelectOptions: function(input) {
    return api.getMediaSuggestion(input || this.state.title, this.state.type.value)
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
    const value = event.label && event.value ? event : event.target.value;
    this.setState({ [field]: value });
  },
  handleSubmit: function(event) {
    event.preventDefault();

    api.playFile(this.props.file.file, {
      type: this.state.type.value,
      imdb: this.state.imdb.value,
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
              options={[{ value: 'show', label: 'show'}, { value: 'movie', label: 'movie' }]}
              value={this.state.type}
              onChange={this.onChangeInput.bind(this, 'type')}
            />
          </div>

          <div className="field-group">
            <Select.Async
              name="imdb"
              loadOptions={this.getSelectOptions}
              value={this.state.imdb}
              onChange={this.onChangeInput.bind(this, 'imdb')}
            />
          </div>

          {
            this.state.type.value === 'show' && (
              <div className="field-group">
                <input name="s" placeholder="Season" value={this.state.s} onChange={this.onChangeInput.bind(this, 's')} />
              </div>
            )
          }

          {
            this.state.type.value === 'show' && (
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
