import React from 'react';
import styles from '../theme.css';

import ScreenshotsGallery from './../screenshots-gallery/screenshots-gallery';
import TraktReport from './../trakt-report';

import Tabs from '../ui/tabs/tabs';

export default React.createClass({
  render: function() {
    const UPCOMING = 'Upcoming';
    const SCREENSHOTS = 'Screenshots';

    const elements = {
      [UPCOMING]: { component: TraktReport },
      [SCREENSHOTS]: { component: ScreenshotsGallery }
    };

    return <Tabs elements={elements} initial={UPCOMING} />;
  }
});
