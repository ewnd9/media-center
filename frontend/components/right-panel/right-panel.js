import React from 'react';
import themeStyles from '../theme.css';
import styles from './style.css';

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
    const { showVideo, mediaListProps } = this.props;

    const MEDIA = 'Media';
    const UPCOMING = 'Upcoming';
    const SCREENSHOTS = 'Screenshots';
    const YOUTUBE = 'Youtube';
    const MARKS = 'Marks';

    const elements = [];

    if (showVideo) {
      // don't move this.props.files above, references issue

      const render = () => (
        <MediaListContainer
          files={this.props.files}
          mediaListProps={mediaListProps} />
      );

      elements.push(createRouterElement('/media', MEDIA, render));
    }

    elements.push(createRouterElement('/trakt', UPCOMING, TraktReport));
    elements.push(createRouterElement('/screenshots', SCREENSHOTS, ScreenshotsGallery));
    elements.push(createRouterElement('/youtube', YOUTUBE, YoutubeInput));
    elements.push(createRouterElement('/marks', MARKS, MarksList));

    const defaultRoute = showVideo && '/media' || '/trakt';

    const Head = (<div className={styles.logo}></div>);

    const Shell = ({ children }) => (
      <Tabs elements={elements} initial={defaultRoute} head={Head}>
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
    link: ({ className, onClick }) => (
      <Link activeClassName={themeStyles.activeButton} to={to} className={className} onClick={onClick}>{label}</Link>
    ),
    url: to,
    component
  };
}
