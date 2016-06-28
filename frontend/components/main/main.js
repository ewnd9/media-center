import React from 'react';
import styles from './style.css';

import * as api from '../../api';
import { connect } from 'react-redux';
import { fetchFiles } from '../../actions/files-actions';

import {
  UPDATE_PLAYBACK,
  RELOAD_FILES,
  USER_PAUSE_MEDIA,
  USER_CLOSE,
  STOPPED
} from '../../constants';

import MediaList from '../media-list/media-list';
import Playback from '../playback/playback';
import RightPanel from '../right-panel/right-panel';
import MediaModal from '../media-modal/media-modal';

/* global io */
require('script!socket.io-client/socket.io.js');
const socket = io(api.baseUrl);

function isWideScreen() {
  return window.innerWidth > 1080; // large-viewport from theme.css
}

const mapDispatchToProps = { fetchFiles };

const Main = React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false,
      socket,
      isWideScreen: isWideScreen()
    };
  },
  componentDidMount: function() {
    const { fetchFiles } = this.props;

    window.addEventListener('resize', this.handleResize);

    socket.on(UPDATE_PLAYBACK, playback => this.setState({ playback }));
    socket.on(RELOAD_FILES, fetchFiles);

    fetchFiles();
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },
  handleResize() {
    this.setState({ isWideScreen: isWideScreen() });
  },
  openModal: function(file) {
    this.setState({ modalIsOpen: true, file });
  },
  closeModal: function() {
    this.setState({ modalIsOpen: false });
    this.props.fetchFiles();
  },
  socketEmit: function(event, data) {
    this.state.socket.emit(event, data);
  },
  render: function() {
    const { files } = this.props;
    const mediaListProps = {
      openModal: this.openModal,
      setPlayback: this.setPlayback,
      files
    };

    return (
      <div>
        { this.state.isWideScreen && (
          <div className={styles.container}>
            <MediaList
              isLeftPanel={true}
              mediaListProps={mediaListProps} />
            <RightPanel
              files={files} />
          </div>
        ) || (
          <RightPanel
            mediaListProps={mediaListProps}
            isFullWidth={true} />
        )}

        {
          this.state.playback && this.state.playback.status !== STOPPED && (
            <Playback
              playback={this.state.playback}
              onPlay={this.socketEmit.bind(this, USER_PAUSE_MEDIA, {})}
              onPause={this.socketEmit.bind(this, USER_PAUSE_MEDIA, {})}
              onClose={this.socketEmit.bind(this, USER_CLOSE, {})} />
          )
        }

        <MediaModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal} />
      </div>
    );
  }
});

export default connect(null, mapDispatchToProps)(Main);
