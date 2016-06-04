import React from 'react';

import themeStyles from '../../theme.css';
import styles from './style.css';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { MEDIA_LIST_UNWATCHED } from '../../../constants';

import MediaListDirectory from '../media-list-directory/media-list-directory';
import MediaListChildrenContainer from '../media-list-children-container/media-list-children-container';

const FirstChild = React.createClass({
  render: function() {
    const children = React.Children.toArray(this.props.children);
    return children[0] || null;
  }
});

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
      isLeftPanel,
      files,
      mediaListProps: { openModal }
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
        // key={activeKey} for MediaListChildrenContainer
        // causes https://github.com/facebook/react/issues/4876
        // without key there is no animation on changing files on the same group

        <ReactCSSTransitionGroup
          key={i++}
          transitionName={transitionClasses}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
          component={FirstChild}>

          { hasChildren && (
            <MediaListChildrenContainer
              openModal={openModal}
              isLeftPanel={isLeftPanel}
              mode={mode}
              activeChildren={activeChildren} />
          ) || null }

        </ReactCSSTransitionGroup>
      );

      const domChildren = activeKey ? this.retrieveDomChildren() : [];

      const renderedFiles = files
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
            <MediaListDirectory
              file={file}
              key={i++}
              activeKey={activeKey}
              setActive={this.setActive}
              setPosition={this.setPosition}
              openModal={openModal} />
          );

          if (key === activeKey) {
            activeOffset = domChildren[index].offsetTop;
            activeChildren = file.media;
          }

          return total;
        }, []);

      if (activeChildren && !isNextRowFounded) {
        renderedFiles.push(renderChildren(true));
      }

      return renderedFiles;
    };

    return (
      <div className={`${styles.flex} ${themeStyles.imageContainer}`} ref={this.setRef}>
        {renderFolders()}
      </div>
    );
  }
});

export default MediaList;
