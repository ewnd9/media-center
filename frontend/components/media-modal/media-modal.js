import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import { closeModal, fetchSuggestions, selectSuggestion, changeField } from '../../actions/modal-actions';
import { playFile, saveInfo, setHidden } from '../../actions/files-actions';

import Modal from 'react-modal';
import MediaDialog from './media-dialog/media-dialog';

import { propTypes } from 'tcomb-react';
import { modalSchema } from './schema';

const mapStateToProps = ({ modal }) => ({ modal });
const mapDispatchToProps = {
  closeModal,
  fetchSuggestions,
  selectSuggestion,
  changeField,
  playFile,
  saveInfo,
  setHidden
};

const MediaModal = React.createClass({
  propTypes: propTypes(modalSchema),
  render() {
    const {
      modal: { isOpened },
      closeModal,
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

        <MediaDialog {...this.props} />
      </Modal>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MediaModal);
