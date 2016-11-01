import React from 'react';
import { Router, Route, IndexRedirect, IndexRoute, Redirect, browserHistory } from 'react-router';

import Movie from './components/movie/movie';
import MoviesList from './components/movies-list/movies-list';

import TraktReport from './components/trakt-report/trakt-report';
import Show from './components/show/show';

import MediaList from './components/media-list/media-list';
import ScreenshotsGallery from './components/screenshots-gallery/screenshots-gallery';
import YoutubeInput from './components/youtube/youtube';

// used in /frontend/components/right-panel/right-panel.js
export default ({ shell }) => (
  <Router history={browserHistory}>
    <Route path="/" component={shell}>
      <IndexRedirect to="/shows" />
      <Route path="/media" component={MediaList} />

      <Route path="/movies">
        <IndexRoute component={MoviesList} />
        <Route path="/movies/:imdb" component={Movie} />
      </Route>

      <Route path="/shows">
        <IndexRoute component={TraktReport} />
        <Route path="/shows/:imdb" component={Show} />
      </Route>

      <Route path="/screenshots" component={ScreenshotsGallery} />
      <Route path="/youtube" component={YoutubeInput} />

      <Redirect from="*" to="/shows" />
    </Route>
  </Router>
);
