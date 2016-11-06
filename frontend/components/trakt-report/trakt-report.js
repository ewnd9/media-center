import React from 'react';

import Spinner from '../ui/spinner/spinner';
import { connect } from 'react-redux';

import { fetchTraktReport } from '../../actions/trakt-report-actions';
import ListItemShow from '../ui/list-item-show/list-item-show';
import { Link } from 'react-router';

import { groupShowsByAirDatesFlatten } from 'show-episode-format';
import moment from 'moment';

const mapStateToProps = ({ traktReport: { isFetching, report } }) => ({ isFetching, report });
const mapDispatchToProps = { fetchTraktReport };

const TraktReport = React.createClass({
  componentDidMount: function() {
    this.props.fetchTraktReport();
  },
  render: function() {
    const { isFetching, report } = this.props;

    const renderReport = report => report.map((group, index) => {
      if (index > 0) {
        return (
          <div key={index}>
            <hr />
            { renderGroup(group) }
          </div>
        );
      } else {
        return renderGroup(group);
      }
    });

    const renderGroup = group => group.map(({ show, report }) => {
      const title = (
        <Link to={`/shows/${show.imdb}`}>
          {show.title}
        </Link>
      );

      let body = [];

      const fn = (m, type) => {
        if (report[type].length > 0) {
          const groups = report[type];
          body.push(`${m}: ${groups.map(g => g.title).join(', ')}`);
        }
      };

      fn('Unwatched', 'aired');
      fn('Unaired', 'unaired');

      if (body.length === 0) {
        return null;
      }

      return (
        <ListItemShow
          key={show.imdb}
          posterUrl={show.posterUrl}
          title={title}
          badge={show.status}
          body={body} />
      );
    });

    if (report != null && !isFetching) {
      return (
        <div>
          {
            renderReport(
              groupShowsByAirDatesFlatten(
                report,
                episodesSelector,
                isWatchedSelector,
                hasFileSelector,
                formatInterval
              )
            )
          }
        </div>
      );
    } else {
      return <Spinner />;
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(TraktReport);

function episodesSelector(show) {
  return show.episodes;
}

function isWatchedSelector(ep) {
  return !!ep.watched;
}

function hasFileSelector() {
  return false;
}

function formatInterval(date) {
  const m = moment(date);
  return `${m.fromNow()} (${m.format('ddd')})`;
}
