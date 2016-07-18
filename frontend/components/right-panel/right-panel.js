import React from 'react';
import styles from './style.css';

import Tabs from '../ui/tabs/tabs';
import Router from '../../routes';

import ScreenshotsGallery from '../screenshots-gallery/screenshots-gallery';
import TraktReport from '../trakt-report/trakt-report';
import MediaList from '../media-list/media-list';
import YoutubeInput from '../youtube/youtube';

import MarksList from '../marks-list/marks-list';
import MarksView from '../marks-view/marks-view';

import BooksList from '../books-list/books-list';
import BooksView from '../books-view/books-view';

import { Link, IndexRoute, Route } from 'react-router';

const RightPanel = React.createClass({
  render: function() {
    const { isFullWidth, mediaListProps } = this.props;

    const MEDIA = 'Media';
    const UPCOMING = 'Upcoming';
    const SCREENSHOTS = 'Screens';
    const YOUTUBE = 'Youtube';
    const MARKS = 'Marks';
    const BOOKS = 'Books';

    const elements = [];

    if (isFullWidth) {
      // don't move this.props.files above, references issue

      const render = () => (
        <MediaList
          mediaListProps={mediaListProps} />
      );

      elements.push(createRouterElement('/media', MEDIA, render));
    }

    elements.push(createRouterElement('/trakt', UPCOMING, TraktReport));
    elements.push(createRouterElement('/screenshots', SCREENSHOTS, ScreenshotsGallery));
    elements.push(createRouterElement('/youtube', YOUTUBE, YoutubeInput));
    elements.push(createRouterElement('/marks', MARKS, null, [
      React.createElement(IndexRoute, { key: '/marks', component: MarksList }),
      React.createElement(Route, { key: '/marks/:id', path: '/marks/:id', component: MarksView, isFullWidth })
    ]));
    elements.push(createRouterElement('/books', BOOKS, null, [
      React.createElement(IndexRoute, { key: '/books', component: BooksList }),
      React.createElement(Route, { key: '/books/:id', path: '/books/:id', component: BooksView }),
      React.createElement(Route, { key: '/books/:id/:chapter', path: '/books/:id/:chapter', component: BooksView })
    ]));

    const defaultRoute = isFullWidth && '/media' || '/trakt';

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

function createRouterElement(to, label, component, children) {
  return {
    label,
    type: 'router',
    link: ({ className, onClick }) => (
      <Link activeClassName={styles.activeButton} to={to} className={className} onClick={onClick}>{label}</Link>
    ),
    url: to,
    component,
    children
  };
}
