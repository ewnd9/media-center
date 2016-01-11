import React from 'react';
import Modal from 'react-modal';

import MediaListContainer from './media-list-container';
import TraktReport from './trakt-report';
import MediaDialog from './media-dialog';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

export default React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false
    };
  },
  openModal: function(file) {
    this.setState({ modalIsOpen: true, file });
  },
  closeModal: function(event) {
    event.preventDefault();
    this.setState({ modalIsOpen: false });
  },
  render: function() {
    return (
			<div>
        <div className="my-container container-fluid">
          <div className="col-md-6">
            <MediaListContainer openModal={this.openModal} />
          </div>
          <div className="col-md-6">
            <TraktReport />
          </div>
        </div>

        <Modal
          isOpen={this.state.modalIsOpen}
          style={customStyles}
          onRequestClose={this.closeModal}>
          <MediaDialog closeModal={this.closeModal} file={this.state.file} />
        </Modal>
			</div>
    );
	}
});
