import React from 'react';
import styles from './style.css';

import MediaList from './media-list-grid/media-list-grid';
import Tabs from '../ui/tabs/tabs';

import { MEDIA_LIST_ALL, MEDIA_LIST_UNWATCHED } from '../../constants';

export default React.createClass({
  render: function() {
    const { mediaListProps, files, isLeftPanel } = this.props;

    const className = isLeftPanel ? styles.leftPanel : styles.imageContainer;
    const el = label => ({
      label,
      component: MediaList,
      getProps: mode => ({
        mediaListProps,
        isLeftPanel,
        files,
        mode
      })
    });

    const elements = [
      el(MEDIA_LIST_ALL),
      el(MEDIA_LIST_UNWATCHED)
    ];

    let initial = localStorage.mode;

    if (!elements[initial]) {
      initial = MEDIA_LIST_UNWATCHED;
      delete localStorage.mode;
    }

    return (
      <div className={`${className}`}>
        <Tabs
          isLeftPanel={isLeftPanel}
          isStacked={!isLeftPanel}
          elements={elements}
          initial={initial} />
      </div>
    );
  }
});
