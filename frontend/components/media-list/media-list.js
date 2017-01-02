import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import MediaListGrid from './media-list-grid/media-list-grid';
import Tabs from '../ui/tabs/tabs';
import Spinner from '../ui/spinner/spinner';

import { MEDIA_LIST_ALL, MEDIA_LIST_UNWATCHED } from '../../constants';
import { fetchFiles, playFile, addToHistory, setActiveKey, deleteFile } from '../../actions/files-actions';
import { postServer } from '../../actions/torrents-actions';
import { openModal } from '../../actions/modal-actions';

const mapStateToProps = ({ files: { files, isFetching, activeKey, addToHistoryKeyInProgress, deleteFileKeyInProgress }, width: { isWideScreen } }) => ({
  files, isFetching, activeKey, addToHistoryKeyInProgress, deleteFileKeyInProgress, isWideScreen
});
const mapDispatchToProps = { fetchFiles, playFile, openModal, addToHistory, setActiveKey, deleteFile, postServer };

const MediaList = React.createClass({
  componentDidMount() {
    this.props.fetchFiles();
  },
  componentWillReceiveProps(nextProps) {
    const { location: { pathname } } = this.props;

    if (pathname === '/media' && nextProps.isWideScreen) {
      this.context.router.push('/shows');
    }
  },
  render: function() {
    const {
      isLeftPanel,
      files,
      isFetching,
      activeKey,
      addToHistoryKeyInProgress,
      deleteFileKeyInProgress,

      openModal,
      playFile,
      addToHistory,
      deleteFile,
      setActiveKey,
      postServer
    } = this.props;

    const className = isLeftPanel ? styles.leftPanel : styles.imageContainer;
    const el = label => ({
      label,
      component: isFetching ? Spinner : MediaListGrid,
      getProps: mode => ({
        openModal,
        playFile,
        addToHistory,
        deleteFile,
        setActiveKey,
        postServer,

        isLeftPanel,
        files,
        mode,
        activeKey,
        addToHistoryKeyInProgress,
        deleteFileKeyInProgress
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

MediaList.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(MediaList);
