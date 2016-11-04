import React from 'react';
import { Router, Route, IndexRedirect, IndexRoute, Redirect, browserHistory } from 'react-router';

import Movie from './components/movie/movie';
import MoviesList from './components/movies-list/movies-list';

import TraktReport from './components/trakt-report/trakt-report';
import Show from './components/show/show';

import Person from './components/person/person';

import MediaList from './components/media-list/media-list';
import ScreenshotsGallery from './components/screenshots-gallery/screenshots-gallery';
import YoutubeInput from './components/youtube/youtube';

import withScroll from 'scroll-behavior';

const history = withScroll(browserHistory, (prevLocation, location) => (
  !prevLocation || location.pathname !== prevLocation.pathname
));

// used in /frontend/components/right-panel/right-panel.js
export default ({ shell }) => (
  <Router history={history}>
    <Route path="/" component={shell}>
      <IndexRedirect to="/shows" />
      <Route path="/media" component={MediaList} />

      <Route path="/movies">
        <IndexRoute component={MoviesList} />
        <Route path="/movies/tmdb/:tmdb" component={Movie} />
        <Route path="/movies/:imdb" component={Movie} />
      </Route>

      <Route path="/shows">
        <IndexRoute component={TraktReport} />
        <Route path="/shows/tmdb/:tmdb" component={Show} />
        <Route path="/shows/:imdb" component={Show} />
      </Route>

      <Route path="/persons">
        <Route path="/persons/tmdb/:tmdb" component={Person} />
        <Route path="/persons/:imdb" component={Person} />
      </Route>

      <Route path="/screenshots" component={ScreenshotsGallery} />
      <Route path="/youtube" component={YoutubeInput} />

      <Redirect from="*" to="/shows" />
    </Route>
  </Router>
);
