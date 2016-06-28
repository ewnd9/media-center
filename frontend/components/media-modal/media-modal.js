import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';
import { closeModal } from '../../actions/modal-actions';

import Modal from 'react-modal';
import MediaDialog from './media-dialog/media-dialog';

const mapStateToProps = ({ modal: { isOpened, file } }) => ({ isOpened, file });
const mapDispatchToProps = { closeModal };

const MediaModal = React.createClass({
  render() {
    const { isOpened, closeModal, file } = this.props;

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
          file={file} />

      </Modal>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MediaModal);
