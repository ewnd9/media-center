import React from 'react';

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

    let activeChilds;
    let nextRowFounded;

    const isUnwatched = mode === MEDIA_LIST_UNWATCHED;

    const createChilds = () => (
      <MediaListChildrenContainer
        key={activeKey}
        rightToLeft={rightToLeft}
        openModal={openModal}
        mode={mode}
        activeChilds={activeChilds} />
    );

    return (
      <div>
        {
          this.props.files
            .filter(file => {
              return !isUnwatched || !file.watched;
            })
            .map((file, index) => {
              const key = file.key;

              if (key === activeKey) {
                activeChilds = file.media;
              }

              let currActiveChilds;

              if (positions[key] > positions[activeKey] && !nextRowFounded) {
                nextRowFounded = true;
                currActiveChilds = true;
              }

              return (
                <div key={index}>
                  {
                    <TransitionGroup>
                      { currActiveChilds && createChilds() }
                    </TransitionGroup>
                  }
                  <MediaListFolder
                    index={index}
                    file={file}
                    currActiveChilds={currActiveChilds}
                    activeKey={activeKey}
                    setActive={this.setActive}
                    setPosition={this.setPosition}
                    rightToLeft={rightToLeft}
                    openModal={openModal} />
                </div>
              );
            })
        }
        <TransitionGroup>
          { !nextRowFounded && activeChilds && createChilds() }
        </TransitionGroup>
      </div>
    );
  }
});

export default MediaList;
