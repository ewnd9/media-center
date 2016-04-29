import React from 'react';
import styles from '../theme.css';

import MediaList from './media-list';
import Tabs from '../ui/tabs/tabs';

export default React.createClass({
  render: function() {
    const { openModal, files, className } = this.props;

    const ALL = 'All';
    const UNWATCHED = 'Unwatched';

    const el = {
      component: MediaList,
      getProps: state => ({
        openModal,
        files,
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
      <div className={`${className} ${this.props.rightToLeft && styles.textAlignRight || ''}`}>
        <Tabs elements={elements} initial={initial} rightToLeft={this.props.rightToLeft} />
      </div>
    );
  }
});
