import React from 'react';

import Spinner from '../ui/spinner/spinner';
import { connect } from 'react-redux';

import { fetchTraktReport } from '../../actions/trakt-report-actions';
import ListItemShow from '../ui/list-item-show/list-item-show';

import { groupShowsByAirDatesFlatten } from 'show-episode-format';

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
        <a href={`https://trakt.tv/shows/${show.imdb}`} target="_blank">
          {show.title}
        </a>
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
          { renderReport(groupShowsByAirDatesFlatten(report, show => show.episodes, ep => !!ep.watched)) }
        </div>
      );
    } else {
      return <Spinner />;
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(TraktReport);
