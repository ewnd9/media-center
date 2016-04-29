import React from 'react';
import styles from '../theme.css';

import MediaList from './media-list';
import Tabs from '../ui/tabs/tabs';

export default React.createClass({
  render: function() {
    const ALL = 'All';
    const UNWATCHED = 'Unwatched';

    const el = {
      component: MediaList,
      getProps: state => ({
        openModal: this.props.openModal,
        files: this.props.files,
        level: 0,
        mode: state
      })
    };

    const elements = {
      [ALL]: el,
      [UNWATCHED]: el
    };

    let initial = localStorage.mode;

    if (!elements[initial]) {
      initial = ALL;
      delete localStorage.mode;
    }

    return (
      <div className={styles.textAlignRight}>
        <Tabs elements={elements} initial={initial} rightToLeft={true} />
      </div>
    );
  }
});
