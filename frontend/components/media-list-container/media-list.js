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
  setRef(el) {
    this.el = el;
  },
  retrieveDomChildren() {
    return Array.prototype.slice
      .call(this.el.children)
      .filter(el => el.className.indexOf('poster') > -1);
  },
  render() {
    const {
      activeKey
    } = this.state;

    const {
      mode,
      rightToLeft,
      openModal
    } = this.props;

    const isUnwatched = mode === MEDIA_LIST_UNWATCHED;

    const renderFolders = () => {
      let activeChildren;
      let activeOffset = null;

      let isNextRowFounded;
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
              activeChildren={activeChildren} />
          ) || null }

        </ReactCSSTransitionGroup>
      );

      const domChildren = activeKey ? this.retrieveDomChildren() : [];

      const files = this.props.files
        .filter(file => {
          return !isUnwatched || !file.watched;
        })
        .reduce((total, file, index) => {
          const key = file.key;

          let isNextRowAfterActive;

          if (activeOffset !== null && !isNextRowFounded && domChildren[index].offsetTop > activeOffset) {
            isNextRowAfterActive = true;
            isNextRowFounded = true;
          }

          total.push(renderChildren(isNextRowAfterActive));

          total.push(
            <MediaListFolder
              file={file}
              key={i++}
              activeKey={activeKey}
              setActive={this.setActive}
              setPosition={this.setPosition}
              rightToLeft={rightToLeft}
              openModal={openModal} />
          );

          if (key === activeKey) {
            activeOffset = domChildren[index].offsetTop;
            activeChildren = file.media;
          }

          return total;
        }, []);

      if (activeChildren && !isNextRowFounded) {
        files.push(renderChildren(true));
      }

      return files;
    };

    return (
      <div className={styles.flex} ref={this.setRef}>
        {renderFolders()}
      </div>
    );
  }
});

export default MediaList;
