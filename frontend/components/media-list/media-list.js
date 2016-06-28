import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import MediaListGrid from './media-list-grid/media-list-grid';
import Tabs from '../ui/tabs/tabs';
import Spinner from '../ui/spinner/spinner';

import { MEDIA_LIST_ALL, MEDIA_LIST_UNWATCHED } from '../../constants';
import { fetchFiles } from '../../actions/files-actions';

const mapStateToProps = ({ files: { files, isFetching }}) => ({ files, isFetching });
const mapDispatchToProps = { fetchFiles };

const MediaList = React.createClass({
  componentDidMount() {
    this.props.fetchFiles();
  },
  render: function() {
    const {
      mediaListProps,
      isLeftPanel,
      files,
      isFetching
    } = this.props;

    const className = isLeftPanel ? styles.leftPanel : styles.imageContainer;
    const el = label => ({
      label,
      component: isFetching ? Spinner : MediaListGrid,
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

export default connect(mapStateToProps, mapDispatchToProps)(MediaList);
