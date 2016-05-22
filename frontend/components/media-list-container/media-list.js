import React from 'react';
import styles from './style.css';

import TransitionGroup from 'react-addons-transition-group';

import { MEDIA_LIST_UNWATCHED } from '../../constants';

import MediaListFolder from './media-list-folder';
import MediaListChildrenContainer from './media-list-children-container';

const MediaList = React.createClass({
  getInitialState() {
    return {
      activeKey: null,
      positions: {}
    };
  },
  setActive(file) {
    const { activeKey } = this.state;

    this.setState({
      activeKey: activeKey !== file.key ? file.key : null
    });
  },
  setPosition(file, position) {
    this.setState({
      positions: {
        ...this.state.positions,
        [file.key]: position
      }
    });
  },
  render() {
    const {
      activeKey,
      positions
    } = this.state;

    const {
      mode,
      rightToLeft,
      openModal
    } = this.props;

    const isUnwatched = mode === MEDIA_LIST_UNWATCHED;

    const createChilds = activeChilds => (
      <MediaListChildrenContainer
        key={activeKey}
        rightToLeft={rightToLeft}
        openModal={openModal}
        mode={mode}
        activeChilds={activeChilds} />
    );

    const renderFolders = () => {
      let activeChilds;
      let nextRowFounded;
      let i = 0;

      const files = this.props.files
        .filter(file => {
          return !isUnwatched || !file.watched;
        })
        .reduce((total, file) => {
          const key = file.key;

          if (key === activeKey) {
            activeChilds = file.media;
          }

          let currActiveChilds;

          if (positions[key] > positions[activeKey] && !nextRowFounded) {
            nextRowFounded = true;
            currActiveChilds = true;
          }

          total.push(
            <TransitionGroup key={i++} style={{textAlign: 'left'}}>
              { currActiveChilds && createChilds(activeChilds) }
            </TransitionGroup>
          );

          total.push(
            <MediaListFolder
              file={file}
              key={i++}
              currActiveChilds={currActiveChilds}
              activeKey={activeKey}
              setActive={this.setActive}
              setPosition={this.setPosition}
              rightToLeft={rightToLeft}
              openModal={openModal} />
          );

          return total;
        }, []);

      if (!nextRowFounded) {
        files.push(
          <TransitionGroup key={i++}>
            { activeChilds && createChilds(activeChilds) }
          </TransitionGroup>
        );
      }

      return files;
    };

    return (
      <div className={styles.flex}>
        {renderFolders()}
      </div>
    );
  }
});

export default MediaList;
