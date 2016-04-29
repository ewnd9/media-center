import React from 'react';
import styles from '../theme.css';

import MediaListItem from './media-list-item';
import { MEDIA_LIST_UNWATCHED } from '../../constants';

export default React.createClass({
  getInitialState: function() {
    const val = localStorage[this.getLocalStorageKey()];
    return { hidden: typeof val !== 'undefined' ? val === 'true' : true };
  },
  toggleHidden: function() {
    this.setState({ hidden: !this.state.hidden });
    localStorage[this.getLocalStorageKey()] = !this.state.hidden;
  },
  getLocalStorageKey: function() {
    return `folder:${this.props.file.dir}`;
  },
  render: function() {
    const { file, rightToLeft } = this.props;
    const summary = file.summary;

    if (file.watched && this.props.mode === MEDIA_LIST_UNWATCHED) {
      return null;
    }

    const childs = file.media.map((media, index) => {
      return (
        <MediaListItem key={index}
                       file={media}
                       index={index}
                       mode={this.props.mode}
                       rightToLeft={rightToLeft}
                       openModal={this.props.openModal} />
      );
    });

    return (
      <div className={`${styles.marginBottom20} ${rightToLeft && styles.textAlignRight || ''}`}>
        <a className="title file-title" onClick={this.toggleHidden}>{summary}</a>
        {
          !this.state.hidden && childs || ''
        }
      </div>
    );
  }
});
