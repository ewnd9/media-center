import React from 'react';
import styles from './style.css';

import * as api from '../../../api';
import Select from 'react-select';

import IconButton from '../../ui/icon-button/icon-button';
import MediaDialogAutosuggest from '../media-dialog-autosuggest/media-dialog-autosuggest';

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
        type: {
          label: 'show',
          value: 'show'
        }
      };
    }
  },
  onChangeInput: function(field, event) {
    const value = event.label && event.value ? event : event.target.value;
    this.setState({ [field]: value });
  },
  getInfo: function() {
    return {
      type: this.state.type.value,
      imdb: this.state.imdb.value,
      title: this.state.imdb.label,
      s: this.state.s,
      ep: this.state.ep
    };
  },
  handlePlaying: function(event, noScrobble) {
    event.preventDefault();

    api.playFile(this.props.file.file, noScrobble ? {} : this.getInfo(), null, noScrobble)
      .then(() => this.props.closeModal(event));
  },
  handleSaveInfo: function(event) {
    event.preventDefault();

    api.saveInfo(this.props.file.file, this.getInfo())
      .then(() => this.props.closeModal(event));
  },
  handleHide: function(event) {
    event.preventDefault();

    api.setHidden(this.props.file.file, this.props.file.filename)
      .then(() => this.props.closeModal(event));
  },
  isNotValid: function() {
    return !!!this.state.imdb || this.state.type.value === 'show' && (!this.state.s || !this.state.ep);
  },
  onSaveClick: function(fn, event) {
    if (!this.isNotValid()) {
      fn(event);
    }
  },
  handleImdbUpdate(value, label) {
    this.setState({ imdb: { value, label } });
  },
  render: function() {
    return (
      <div className={styles.container}>
        <h2>{this.props.file.filename}</h2>
        <form>
          <div className="field-group">
            <Select
              name="type"
              options={[{ value: 'show', label: 'show'}, { value: 'movie', label: 'movie' }]}
              value={this.state.type}
              onChange={this.onChangeInput.bind(this, 'type')}
            />
          </div>

          <div className="field-group">
            <MediaDialogAutosuggest
              recognition={this.props.file.recognition}
              type={this.state.type.value}
              updateImdb={this.handleImdbUpdate} />
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

          <div className={`field-group ${styles.controls}`}>
            <IconButton className={styles.buttonMarginBottom} icon="play" disabled={this.isNotValid()} onClick={this.onSaveClick.bind(this, this.handlePlaying)}>
              Play
            </IconButton>
            <IconButton className={styles.buttonMarginBottom} icon="floppy-saved" disabled={this.isNotValid()} onClick={this.onSaveClick.bind(this, this.handleSaveInfo)}>
              Save & Close
            </IconButton>
            <IconButton className={styles.buttonMarginBottom} icon="eye-close" onClick={e => this.handlePlaying(e, true)}>
              Play Without Scrobble
            </IconButton>
            <IconButton className={styles.buttonMarginBottom} icon="tree-conifer" onClick={this.handleHide}>
              Hide File
            </IconButton>
            <IconButton className={styles.buttonMarginBottom} icon="remove" onClick={this.props.closeModal}>
              Close
            </IconButton>
          </div>
        </form>
      </div>
    );
  }
});
