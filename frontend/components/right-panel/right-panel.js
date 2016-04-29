import React from 'react';

import ScreenshotsGallery from './../screenshots-gallery/screenshots-gallery';
import TraktReport from './../trakt-report/trakt-report';
import MediaListContainer from '../media-list-container/media-list-container';

import Tabs from '../ui/tabs/tabs';

export default React.createClass({
  render: function() {
    const { showVideo, className } = this.props;

    const VIDEO = 'Video';
    const UPCOMING = 'Upcoming';
    const SCREENSHOTS = 'Screenshots';

    const elements = {};

    if (showVideo) {
      elements[VIDEO] = {
        component: MediaListContainer,
        getProps: () => ({
          openModal: this.props.openModal,
          setPlayback: this.props.setPlayback,
          files: this.props.files
        })
      };
    }

    elements[UPCOMING] = { component: TraktReport };
    elements[SCREENSHOTS] = { component: ScreenshotsGallery };

    return <Tabs className={className} elements={elements} initial={showVideo && VIDEO || UPCOMING} />;
  }
});
