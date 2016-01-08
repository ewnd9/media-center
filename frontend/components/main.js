import React from 'react';
import Modal from 'react-modal';

import MediaList from './media-list';
import MediaDialog from './media-dialog';

import * as api from './../api';

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

require('script!socket.io-client/socket.io.js');

export default React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false,
      files: [],
      mode: localStorage.mode || 'all'
    };
  },
  getFiles: function() {
    api.findFiles().then((files) => this.setState({ files }));
  },
  componentDidMount: function() {
    const socket = io(api.baseUrl);
    socket.on('PAUSE_MEDIA', () => this.getFiles());

    this.getFiles();
  },
  openModal: function(file) {
    this.setState({ modalIsOpen: true, file });
  },
  closeModal: function(event) {
    event.preventDefault();
    this.setState({ modalIsOpen: false });
    this.getFiles();
  },
  setMode: function(mode) {
    localStorage.mode = mode;
    this.setState({ mode });
  },
  render: function() {
    return (
			<div>
        <div className="my-container">
          <div id="top-options" className="btn-group btn-group-sm" role="group">
            <button type="button"
                    onClick={this.setMode.bind(this, 'all')}
                    className={`btn btn-default ${this.state.mode === 'all' ? 'active' : ''}`}>
              All
            </button>
            <button type="button"
                    onClick={this.setMode.bind(this, 'not-watched')}
                    className={`btn btn-default ${this.state.mode === 'not-watched' ? 'active' : ''}`}>
              Not Watched
            </button>
          </div>

				  <MediaList openModal={this.openModal} files={this.state.files} level={0} mode={this.state.mode} />
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
