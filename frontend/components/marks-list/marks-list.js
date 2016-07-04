import React from 'react';

import { connect } from 'react-redux';

import InfiniteScroll from 'react-infinite-scroller';
import { formatEpisode } from 'show-episode-format';

import { fetchMarks } from '../../actions/marks-actions';
import { Link } from 'react-router';

import ListItemShow from '../ui/list-item-show/list-item-show';
import Spinner from '../ui/spinner/spinner';

const mapStateToProps = ({ marks: { marks, isFetching, hasMore, hasInitialLoad }}) =>
  ({ marks, isFetching, hasMore, hasInitialLoad });

const mapDispatchToProps = { fetchMarks };

const MarksList = React.createClass({
  loadMore() {
    const { marks, fetchMarks } = this.props;

    const since = marks.length > 0 ?
      marks[marks.length - 1]._key : undefined;

    fetchMarks(since);
  },
  renderMark(mark, index) {
    const { _id, title, s, ep, posterUrl, marks } = mark;

    const markTitle = `${title} ${s && ep && formatEpisode(s, ep) || ''}`;
    const body = (
      <div>
        {marks.length} marks
        {' '}
        <Link to={`/marks/${_id.replace(/:/g, '-')}`}>
          (Open)
        </Link>
      </div>
    );

    return (
      <ListItemShow
        key={index}
        posterUrl={posterUrl}
        title={markTitle}
        body={body} />
    );
  },
  render() {
    const { marks, isFetching, hasMore, hasInitialLoad } = this.props;

    return (
      <InfiniteScroll
          pageStart={0}
          loadMore={this.loadMore}
          hasMore={!isFetching && hasMore}
          loader={<div className="loader">Loading ...</div>}
          useWindow={false}>

        { hasInitialLoad && marks.map(this.renderMark) || <Spinner /> }

      </InfiniteScroll>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MarksList);
