import React from 'react';
import styles from './style.css';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

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

    const renderFolders = () => {
      let activeChilds;
      let nextRowFounded;
      let i = 0;

      const transitionClasses = {
        enter: styles.exampleEnter,
        enterActive: styles.exampleEnterActive,
        leave: styles.exampleLeave,
        leaveActive: styles.exampleLeaveActive
      };

      const renderChildren = hasChildren => (
        <ReactCSSTransitionGroup
          component='div'
          key={i++}
          style={{width: hasChildren ? '100%' : 'auto'}}
          transitionName={transitionClasses}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}>

          { hasChildren && (
            <MediaListChildrenContainer
              key={activeKey}
              rightToLeft={rightToLeft}
              openModal={openModal}
              mode={mode}
              activeChilds={activeChilds} />
          ) || null }

        </ReactCSSTransitionGroup>
      );

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

          total.push(renderChildren(currActiveChilds));

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
        files.push(renderChildren(activeChilds));
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
