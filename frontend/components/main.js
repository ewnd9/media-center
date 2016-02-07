import React from 'react';
import Modal from 'react-modal';

import * as api from './../api';
import {
  UPDATE_PLAYBACK,
  RELOAD_FILES,
  USER_PAUSE_MEDIA,
  USER_CLOSE,
  STOPPED
} from './../constants';

import MediaListContainer from './media-list-container';
import MediaDialog from './media-dialog';
import Playback from './playback';
import RightPanel from './right-panel/right-panel';

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

/* global io */
require('script!socket.io-client/socket.io.js');
const socket = io(api.baseUrl);

export default React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false,
      files: [],
      socket
    };
  },
  componentDidMount: function() {
    socket.on(UPDATE_PLAYBACK, playback => this.setState({ playback }));
    socket.on(RELOAD_FILES, () => this.getFiles());

    this.getFiles();
  },
  getFiles: function() {
    api.findFiles().then((files) => this.setState({ files }));
  },
  openModal: function(file) {
    this.setState({ modalIsOpen: true, file });
  },
  closeModal: function(event) {
    event.preventDefault();
    this.setState({ modalIsOpen: false });
    this.getFiles();
  },
  socketEmit: function(event, data) {
    this.state.socket.emit(event, data);
  },
  render: function() {
    return (
      <div>
        <div className="my-container container-fluid">
          <div className="col-md-6 left-panel">
            <MediaListContainer
              openModal={this.openModal}
              setPlayback={this.setPlayback}
              files={this.state.files} />
          </div>
          <div className="col-md-6 right-panel">
            <RightPanel />
          </div>
        </div>

        {
          this.state.playback && this.state.playback.status !== STOPPED && (
            <div className="container bottom-playback-panel-holder">
              <div className="col-md-6 col-md-offset-3 bottom-playback-panel">
                <Playback
                  playback={this.state.playback}
                  onPlay={this.socketEmit.bind(this, USER_PAUSE_MEDIA, {})}
                  onPause={this.socketEmit.bind(this, USER_PAUSE_MEDIA, {})}
                  onClose={this.socketEmit.bind(this, USER_CLOSE, {})} />
              </div>
            </div>
          )
        }

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
