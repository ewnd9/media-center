import React from 'react';
import styles from './style.css';

import Modal from 'react-modal';

import * as api from './../api';

import {
  UPDATE_PLAYBACK,
  RELOAD_FILES,
  USER_PAUSE_MEDIA,
  USER_CLOSE,
  STOPPED
} from './../constants';

import MediaListContainer from './media-list-container/media-list-container';
import MediaDialog from './media-dialog/media-dialog';
import Playback from './playback/playback';
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

function isWideScreen() {
  return window.innerWidth >= 950;
}

export default React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false,
      files: [],
      socket,
      isWideScreen: isWideScreen()
    };
  },
  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
    socket.on(UPDATE_PLAYBACK, playback => this.setState({ playback }));
    socket.on(RELOAD_FILES, () => this.getFiles());

    this.getFiles();
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },
  handleResize() {
    this.setState({ isWideScreen: isWideScreen() });
  },
  getFiles: function() {
    api.findFiles().then(files => this.setState({ files }));
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
        { this.state.isWideScreen && (
          <div className={styles.container}>
            <MediaListContainer
              className={styles.leftPanel}
              openModal={this.openModal}
              setPlayback={this.setPlayback}
              files={this.state.files}
              rightToLeft={true} />
            <RightPanel
              className={styles.rightPanel} />
          </div>
        ) || (
          <RightPanel
            className={styles.rightPanel}
            openModal={this.openModal}
            setPlayback={this.setPlayback}
            files={this.state.files}
            showVideo={true} />
        )}

        {
          this.state.playback && this.state.playback.status !== STOPPED && (
            <div className={styles.playbackPanel}>
              <Playback
                playback={this.state.playback}
                onPlay={this.socketEmit.bind(this, USER_PAUSE_MEDIA, {})}
                onPause={this.socketEmit.bind(this, USER_PAUSE_MEDIA, {})}
                onClose={this.socketEmit.bind(this, USER_CLOSE, {})} />
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
