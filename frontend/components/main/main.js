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
  getInitialState() {
    return {
      isWideScreen: isWideScreen()
    };
  },
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  },
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  handleResize() {
    this.setState({ isWideScreen: isWideScreen() });
  },
  render: function() {
    const { files } = this.props;

    return (
      <div>
        { this.state.isWideScreen && (
          <div className={styles.container}>
            <MediaList
              isLeftPanel={true} />
            <RightPanel
              files={files} />
          </div>
        ) || (
          <RightPanel
            isFullWidth={true} />
        )}

        <Playback />
        <MediaModal />
      </div>
    );
  }
});

export default Main;
