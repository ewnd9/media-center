import React from 'react';
import Modal from 'react-modal';

import MediaList from './media-list';
import MediaDialog from './media-dialog';

export default React.createClass({
  getInitialState: function() {
    return { modalIsOpen: false };
  },
  openModal: function(file) {
    this.setState({ modalIsOpen: true, file });
  },
  closeModal: function() {
    this.setState({ modalIsOpen: false });
  },
  render: function() {
    return (
			<div>
        <div className="container">
          <h1>Media Center</h1>
				  <MediaList openModal={this.openModal} />
        </div>

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
          <MediaDialog closeModal={this.closeModal} file={this.state.file} />
        </Modal>
			</div>
    );
	}
});
