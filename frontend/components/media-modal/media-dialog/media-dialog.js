import React from 'react';
import styles from './style.css';

import IconButton from '../../ui/icon-button/icon-button';
import MediaDialogAutosuggest from '../media-dialog-autosuggest/media-dialog-autosuggest';

const MediaDialog = React.createClass({
  componentDidMount() {
    const { file: { recognition }, changeField } = this.props;

    if (recognition) {
      changeField('type', recognition.type);
      changeField('s', recognition.s);
      changeField('ep', recognition.ep);
    }
  },
  onChangeInput: function(field, event) {
    const { changeField } = this.props;

    const value = event.target.value;
    changeField(field, value);
  },
  getInfo() {
    const {
      suggestionSelectedValue: imdb,
      suggestionSelectedLabel: title,
      type,
      s,
      ep
    } = this.props;

    return {
      imdb, title, type, s, ep
    };
  },
  handlePlaying: function(event, noScrobble) {
    const { file, playFile, closeModal } = this.props;

    playFile(file.file, noScrobble ? {} : this.getInfo(), null, noScrobble)
      .then(() => closeModal());
  },
  handleSaveInfo: function() {
    const { file, saveInfo, closeModal } = this.props;

    saveInfo(file.file, this.getInfo())
      .then(() => closeModal());
  },
  handleHide: function() {
    const { file, setHidden, closeModal } = this.props;

    setHidden(file.file, file.filename)
      .then(() => closeModal());
  },
  onSaveClick: function(fn, event) {
    const { isValid } = this.props;

    if (isValid) {
      fn(event);
    }
  },
  render: function() {
    const types = [{ value: 'show', label: 'Show'}, { value: 'movie', label: 'Movie' }];

    const {
      file,
      isFetching,
      isValid,
      type,
      s,
      ep,
      suggestions,
      suggestionSearchTitle,
      suggestionIsValid,
      suggestionSelectedValue,
      suggestionSelectedLabel,

      closeModal,
      fetchSuggestions,
      selectSuggestion
    } = this.props;

    return (
      <div className={styles.container}>
        <h2>{file.filename}</h2>

        <form>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Type

              <div className={styles.selectContainer}>
                <select
                  value={type || ''}
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
                recognition={file.recognition}
                type={type}

                isFetching={isFetching}
                suggestions={suggestions}
                suggestionSearchTitle={suggestionSearchTitle}
                suggestionIsValid={suggestionIsValid}
                suggestionSelectedValue={suggestionSelectedValue}
                suggestionSelectedLabel={suggestionSelectedLabel}

                fetchSuggestions={fetchSuggestions}
                selectSuggestion={selectSuggestion} />
            </label>
          </div>

          {
            type === 'show' && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Season
                  <input
                    className={styles.input}
                    name="s"
                    placeholder="Season"
                    value={s}
                    onChange={this.onChangeInput.bind(this, 's')} />
                </label>
              </div>
            )
          }

          {
            type === 'show' && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Episode
                  <input
                    className={styles.input}
                    name="ep"
                    placeholder="Episode"
                    value={ep}
                    onChange={this.onChangeInput.bind(this, 'ep')} />
                </label>
              </div>
            )
          }

          <div className={`${styles.fieldGroup} ${styles.wordWrap}`}>
            {file.fileName}
          </div>

          <div className={`field-group ${styles.controls}`}>
            <IconButton
              className={styles.buttonMarginBottom}
              icon="play"
              disabled={!isValid}
              onClick={this.onSaveClick.bind(this, this.handlePlaying)}>
              Play
            </IconButton>

            <IconButton
              className={styles.buttonMarginBottom}
              icon="floppy-saved"
              disabled={!isValid}
              onClick={this.onSaveClick.bind(this, this.handleSaveInfo)}>
              Save & Close
            </IconButton>

            <IconButton
              className={styles.buttonMarginBottom}
              icon="eye-close"
              onClick={e => this.handlePlaying(e, true)}>
              Play Without Scrobble
            </IconButton>

            <IconButton
              className={styles.buttonMarginBottom}
              icon="tree-conifer"
              onClick={this.handleHide}>
              Hide File
            </IconButton>

            <IconButton
              className={styles.buttonMarginBottom}
              icon="remove"
              onClick={closeModal}>
              Close
            </IconButton>
          </div>
        </form>
      </div>
    );
  }
});

export default MediaDialog;
