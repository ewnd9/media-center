import React from 'react';
import styles from './style.css';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import Tabs from '../ui/tabs/tabs';
import { Link } from 'react-router';

const RightPanel = React.createClass({
  propTypes: propTypes({
    isWideScreen: t.Boolean,
    children: t.ReactNode
  }),
  render: function() {
    const { isWideScreen, children } = this.props;

    const MEDIA = 'Media';
    const TV = 'TV';
    const SCREENSHOTS = 'Screens';
    const MOVIES = 'Movies';
    const YOUTUBE = 'Youtube';
    const SETTINGS = 'Settings';

    const menuLinks = [];

    if (!isWideScreen) {
      const el = createRouterElement('/media', MEDIA);
      menuLinks.push(el);
    }

    menuLinks.push(createRouterElement('/shows', TV));
    menuLinks.push(createRouterElement('/movies', MOVIES));
    menuLinks.push(createRouterElement('/screenshots', SCREENSHOTS));
    menuLinks.push(createRouterElement('/youtube', YOUTUBE));
    menuLinks.push(createRouterElement('/settings', SETTINGS));

    const Head = (<div className={styles.logo}></div>);

    return (
      <Tabs elements={menuLinks} initial={'/shows'} head={Head}>
        { children }
      </Tabs>
    );
  }
});

export default RightPanel;

function createRouterElement(to, label) {
  return {
    label,
    link: ({ className, onClick }) => (
      <Link activeClassName={styles.activeButton} to={to} className={className} onClick={onClick}>
        {label}
      </Link>
    ),
    url: to
  };
}
