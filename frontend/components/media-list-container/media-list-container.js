import React from 'react';
import styles from '../theme.css';

import MediaList from './media-list';
import Tabs from '../ui/tabs/tabs';

import { MEDIA_LIST_ALL, MEDIA_LIST_UNWATCHED } from '../../constants';

export default React.createClass({
  render: function() {
    const { openModal, files, className } = this.props;

    const el = label => ({
      label,
      component: MediaList,
      getProps: mode => ({
        openModal,
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
      <div className={`${className} ${this.props.rightToLeft && styles.textAlignRight || ''}`}>
        <Tabs elements={elements} initial={initial} rightToLeft={this.props.rightToLeft} />
      </div>
    );
  }
});
