import React from 'react';
import styles from './style.css';

import * as api from '../../../api';

import IconButton from '../../ui/icon-button/icon-button';
import MediaDialogAutosuggest from '../media-dialog-autosuggest/media-dialog-autosuggest';

const MediaDialog = React.createClass({
  getInitialState: function() {
    if (this.props.file.recognition) {
      const r = this.props.file.recognition;

      return {
        type: r.type,
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
    const value = event.target.value;
    this.setState({ [field]: value });
  },
  getInfo: function() {
    return {
      type: this.state.type,
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
    return !!!this.state.imdb || this.state.type === 'show' && (!this.state.s || !this.state.ep);
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
    const types = [{ value: 'show', label: 'Show'}, { value: 'movie', label: 'Movie' }];

    const { type } = this.state;
    const { file } = this.props;

    return (
      <div className={styles.container}>
        <h2>{this.props.file.filename}</h2>
        <form>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Type

              <div className={styles.selectContainer}>
                <select
                  value={type.value}
                  className={styles.select}
                  onChange={this.onChangeInput.bind(this, 'type')}>
                  {
                    types.map(type => (
                      <option value={type.value} key={type.value}>{type.label}</option>
                    ))
                  }
                </select>
              </div>

            </label>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Title
              <MediaDialogAutosuggest
                recognition={this.props.file.recognition}
                type={this.state.type}
                onUpdate={this.handleImdbUpdate} />
            </label>
          </div>

          {
            this.state.type === 'show' && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Season
                  <input className={styles.input} name="s" placeholder="Season" value={this.state.s} onChange={this.onChangeInput.bind(this, 's')} />
                </label>
              </div>
            )
          }

          {
            this.state.type === 'show' && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Episode
                  <input className={styles.input} name="ep" placeholder="Episode" value={this.state.ep} onChange={this.onChangeInput.bind(this, 'ep')} />
                </label>
              </div>
            )
          }

          <div className={styles.fieldGroup}>
            {file.fileName}
          </div>

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

export default MediaDialog;
