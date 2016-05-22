import React from 'react';
import styles from './style.css';

import { MEDIA_LIST_UNWATCHED } from '../../constants';

import MediaListItem from './media-list-item';

const ChildrenContainer = React.createClass({
  setRef(el) {
    if (el) {
      this.el = el;
    }
  },
  render() {
    const {
      rightToLeft,
      openModal,
      mode,
      activeChildren
    } = this.props;

    const isUnwatched = mode === MEDIA_LIST_UNWATCHED;

    return (
      <div
        className={styles.filesList}
        ref={this.setRef}>
        {
          activeChildren
            .filter(media => {
              return !isUnwatched || !media.watched;
            })
            .map((media, index) => {
              return (
                <MediaListItem
                  key={index}
                  file={media}
                  index={index}
                  rightToLeft={rightToLeft}
                  openModal={openModal} />
              );
            })
        }
      </div>
    );
  }
});

export default ChildrenContainer;
