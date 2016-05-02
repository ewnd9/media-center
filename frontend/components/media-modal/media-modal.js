import React from 'react';
import Modal from 'react-modal';

import MediaDialog from './media-dialog/media-dialog';

export default React.createClass({
  render() {
    const { isOpen, onRequestClose, file } = this.props;

    const customStyles = {
      content : {
        position: 'static',
        width: '600px'
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        style={customStyles}
        onRequestClose={onRequestClose}>

        <MediaDialog
          closeModal={onRequestClose}
          file={file} />

      </Modal>
    );
  }
});
