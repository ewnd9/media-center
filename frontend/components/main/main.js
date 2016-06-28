import React from 'react';
import styles from './style.css';

import MediaList from '../media-list/media-list';
import Playback from '../playback/playback';
import RightPanel from '../right-panel/right-panel';
import MediaModal from '../media-modal/media-modal';

function isWideScreen() {
  return window.innerWidth > 1080; // large-viewport from theme.css
}

const Main = React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false,
      isWideScreen: isWideScreen()
    };
  },
  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
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

        <Playback />

        <MediaModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal} />
      </div>
    );
  }
});

export default Main;
