import React from 'react';
import styles from './style.css';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { MEDIA_LIST_UNWATCHED } from '../../../constants';

import MediaListPoster from '../media-list-poster/media-list-poster';
import MediaListItem from '../media-list-item/media-list-item';
import MediaListTorrentForm from '../media-list-torrent-form/media-list-torrent-form';

import { Link } from 'react-router';

const transitionClasses = {
  enter: styles.exampleEnter,
  enterActive: styles.exampleEnterActive,
  leave: styles.exampleLeave,
  leaveActive: styles.exampleLeaveActive
};

const FirstChild = React.createClass({
  render: function() {
    const children = React.Children.toArray(this.props.children);
    return children[0] || null;
  }
});

const MediaList = React.createClass({
  setRef(el) {
    if (el) {
      this.el = el;
    }
  },
  retrieveDomChildren() {
    if (!this.el) {
      return [];
    }

    return Array.prototype.slice
      .call(this.el.children)
      .filter(el => el.className.indexOf('poster') > -1);
  },
  render() {
    const {
      mode,
      files,
      activeKey
    } = this.props;

    const isUnwatched = mode === MEDIA_LIST_UNWATCHED;

    let activeChildren;
    let activeOffset = null;

    let isNextRowFounded;
    let i = 0;

    const domChildren = activeKey ? this.retrieveDomChildren() : [];

    if (activeKey && domChildren.length === 0) {
      // initially we don't need children because they are hidden, but
      // if we refetch files we have an empty list and activeKey
      requestAnimationFrame(() => this.forceUpdate());
    }

    const renderedFiles = files
      .filter(file => {
        return !isUnwatched || (!file.watched && !file.hidden);
      })
      .reduce((total, file, index) => {
        const { key } = file;

        let isNextRowAfterActive;

        if (activeOffset !== null && !isNextRowFounded && domChildren.length > 0 && domChildren[index].offsetTop > activeOffset) {
          isNextRowAfterActive = true;
          isNextRowFounded = true;
        }

        total.push(this.renderExpandedActiveItems(isNextRowAfterActive, activeChildren, i++));
        total.push(this.renderPoster(file, i++));

        if (key === activeKey && domChildren.length > 0) {
          activeOffset = domChildren[index].offsetTop;
          activeChildren = file.media;
        }

        return total;
      }, []);

    if (activeChildren && !isNextRowFounded) {
      renderedFiles.push(this.renderExpandedActiveItems(true, activeChildren, i++));
    }

    return (
      <div className={`${styles.flex} ${styles.imageContainer}`} ref={this.setRef}>
        <MediaListTorrentForm />

        {
          renderedFiles.length === 0 && (
            <div className={styles.emptyInput}>No files were found</div>
          ) || (
            renderedFiles
          )
        }
      </div>
    );
  },
  renderPoster(file, i) {
    const { openModal, setActiveKey } = this.props;

    return (
      <MediaListPoster
        file={file}
        key={i++}
        setActiveKey={setActiveKey}
        setPosition={this.setPosition}
        openModal={openModal} />
    );
  },
  renderLinks(list) {
    if (list[0] && list[0].db) {
      const imdb = list[0].db.imdb;

      const [url, title] = list[0].db.type === 'movie' ?
        ([`/movies/${imdb}`, 'Movie Page']) :
        ([`/shows/${imdb}`, 'Show Page']);

      return (
        <div className={styles.linksPanel}>
          <a target="_blank" href={`http://www.imdb.com/title/${imdb}/`}>
            <span
              className="glyphicon glyphicon-cd"
              aria-hidden="true"></span>
            {' IMDB'}
          </a>
          <Link to={url}>
            <span
              className={`glyphicon glyphicon-cd ${styles.link}`}
              aria-hidden="true"></span>
            {' '}{title}
          </Link>
        </div>
      );
    } else {
      return null;
    }
  },
  renderExpandedActiveItems(hasChildren, activeChildren, i) {
    const {
      isLeftPanel,
      openModal,
      playFile,
      addToHistory,
      addToHistoryKeyInProgress,
      deleteFile,
      deleteFileKeyInProgress,
      postServer
    } = this.props;

    const child = hasChildren && (
      <div
        className={`${styles.filesList} ${isLeftPanel ? styles.textAlignRight : ''}`}>

        { this.renderLinks(activeChildren) }

        {
          activeChildren
            .map((media, index) => {
              return (
                <MediaListItem
                  key={index}
                  file={media}
                  index={index}
                  openModal={openModal}
                  playFile={playFile}
                  addToHistory={addToHistory}
                  addToHistoryKeyInProgress={addToHistoryKeyInProgress}
                  deleteFile={deleteFile}
                  deleteFileKeyInProgress={deleteFileKeyInProgress}
                  postServer={postServer} />
              );
            })
        }
      </div>
    ) || null;

    // key={activeKey} for MediaListChildrenContainer
    // causes https://github.com/facebook/react/issues/4876
    // without key there is no animation on changing files on the same group

    return (
      <ReactCSSTransitionGroup
        key={i++}
        transitionName={transitionClasses}
        transitionEnterTimeout={200}
        transitionLeaveTimeout={200}
        component={FirstChild}>

        { child }

      </ReactCSSTransitionGroup>
    );
  }
});

export default MediaList;
