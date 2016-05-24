import React from 'react';
import themeStyles from '../theme.css';

import Tabs from '../ui/tabs/tabs';
import Router from '../../routes';

import ScreenshotsGallery from '../screenshots-gallery/screenshots-gallery';
import TraktReport from '../trakt-report/trakt-report';
import MediaListContainer from '../media-list-container/media-list-container';
import YoutubeInput from '../youtube-input/youtube-input';
import MarksList from '../marks-list/marks-list';

import { Link } from 'react-router';

const RightPanel = React.createClass({
  render: function() {
    const { showVideo, className } = this.props;

    const MEDIA = 'Media';
    const UPCOMING = 'Upcoming';
    const SCREENSHOTS = 'Screenshots';
    const YOUTUBE = 'Youtube';
    const MARKS = 'Marks';

    const elements = [];

    if (showVideo) {
      elements.push(createRouterElement('/media', MEDIA, () => (
        <MediaListContainer
          className={themeStyles.imageContainer}
          openModal={this.props.openModal}
          setPlayback={this.props.setPlayback}
          files={this.props.files} />
      )));
    }

    elements.push(createRouterElement('/trakt', UPCOMING, TraktReport));
    elements.push(createRouterElement('/screenshots', SCREENSHOTS, ScreenshotsGallery));
    elements.push(createRouterElement('/youtube', YOUTUBE, YoutubeInput));
    elements.push(createRouterElement('/marks', MARKS, MarksList));

    const defaultRoute = showVideo && '/media' || '/trakt';

    const Shell = ({ children }) => (
      <Tabs className={className} elements={elements} initial={defaultRoute}>
        { children }
      </Tabs>
    );

    return (
      <Router
        shell={Shell}
        routes={elements}
        defaultRoute={defaultRoute}
        notFoundComponent="/trakt" />
    );
  }
});

export default RightPanel;

function createRouterElement(to, label, component) {
  return {
    label,
    type: 'router',
    link: ({ className }) => (
      <Link activeClassName={themeStyles.activeButton} to={to} className={className}>{label}</Link>
    ),
    url: to,
    component
  };
}
