import React from 'react';
import styles from './style.css';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';
import { connect } from 'react-redux';

import { reactRouterPropTypes } from '../../schema/react-router';
import { fetchShow } from '../../actions/trakt-report-actions';

import Spinner from '../ui/spinner/spinner';
import Media from '../ui/media/media';

import { schema } from '../../reducers/trakt-report-reducer';
import { formatEpisode } from 'show-episode-format';

import groupBy from 'lodash/groupBy';

const mapStateToProps = ({ traktReport }) => ({ traktReport });
const mapDispatchToProps = { fetchShow };

const Show = React.createClass({
  propTypes: propTypes({
    ...reactRouterPropTypes,
    children: t.Nil,

    traktReport: schema,
    fetchShow: t.Function
  }),
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  componentDidMount() {
    const { fetchShow, routeParams: { tmdb, imdb } } = this.props;
    fetchShow(tmdb, imdb);
  },
  componentWillReceiveProps(nextProps) {
    const { routeParams, fetchShow } = this.props;

    if (routeParams.tmdb && nextProps.traktReport.show) {
      this.context.router.push(`/shows/${nextProps.traktReport.show.imdb}`);
    } else if (nextProps.routeParams.imdb && routeParams.imdb !== nextProps.routeParams.imdb) {
      fetchShow(null, nextProps.routeParams.imdb);
    }
  },
  render() {
    const { traktReport: { show } } = this.props;

    if (!show) {
      return (<Spinner />);
    }

    const seasons = groupBy(show.episodes, ep => ep.season_number);

    const content = (
      <div className={styles.episodesContainer}>
        {
          Object.keys(seasons).map(seasonNumber => (
            <div key={seasonNumber} className={styles.episodeContainer}>
              <div className={styles.title}>Season {seasonNumber}:</div>
              <div>{seasons[seasonNumber].map(ep => formatEpisode(ep)).join(', ')}</div>
            </div>
          ))
        }
      </div>
    );

    return (
      <Media
        posterUrl={show.posterUrl}
        title={show.title}
        tagline={show.status}
        externalIds={[
          { resource: 'IMDB', url:`http://www.imdb.com/title/${show.imdb}/` },
          { resource: 'TRAKT.TV', url:`https://trakt.tv/shows/${show.imdb}` },
          { resource: 'TMDB', url: `https://www.themoviedb.org/tv/${show.tmdb}` },
        ]}
        fields={[
          { field: 'Seasons', value: show.tmdbData.number_of_seasons },
          { field: 'Episodes', value: show.tmdbData.number_of_episodes },
          { field: 'Overview', value: show.tmdbData.overview }
        ]}
        content={content}
        credits={show.tmdbData.credits} />
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Show);
