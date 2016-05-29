import React from 'react';
import styles from './style.css';

import Modal from 'react-modal';
import MediaDialog from './media-dialog/media-dialog';

export default React.createClass({
  render() {
    const { isOpen, onRequestClose, file } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        className={styles.modal}
        overlayClassName={styles.overlay}
        onRequestClose={onRequestClose}>

        <MediaDialog
          closeModal={onRequestClose}
          file={file} />

      </Modal>
    );
  }
});
