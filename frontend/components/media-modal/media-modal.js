import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';
import { closeModal, fetchSuggestions, selectSuggestion, changeField } from '../../actions/modal-actions';
import { playFile, saveInfo, setHidden } from '../../actions/files-actions';

import Modal from 'react-modal';
import MediaDialog from './media-dialog/media-dialog';

const mapStateToProps = ({ modal }) => modal;
const mapDispatchToProps = {
  closeModal, fetchSuggestions, selectSuggestion, changeField,
  playFile, saveInfo, setHidden
};

const MediaModal = React.createClass({
  render() {
    const {
      isOpened,
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
      selectSuggestion,
      changeField,
      playFile,
      saveInfo,
      setHidden
    } = this.props;

    if (!isOpened) {
      return null;
    }

    return (
      <Modal
        className={styles.modal}
        overlayClassName={styles.overlay}
        isOpen={isOpened}
        onRequestClose={closeModal}>

        <MediaDialog
          closeModal={closeModal}
          file={file}
          isFetching={isFetching}
          isValid={isValid}

          type={type}
          s={s}
          ep={ep}
          suggestions={suggestions}
          suggestionSearchTitle={suggestionSearchTitle}
          suggestionIsValid={suggestionIsValid}
          suggestionSelectedLabel={suggestionSelectedLabel}
          suggestionSelectedValue={suggestionSelectedValue}

          fetchSuggestions={fetchSuggestions}
          selectSuggestion={selectSuggestion}
          changeField={changeField}
          playFile={playFile}
          saveInfo={saveInfo}
          setHidden={setHidden} />

      </Modal>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MediaModal);
