import React from 'react';
import themeStyles from '../theme.css';

import InfiniteScroll from 'react-infinite-scroller';
import { formatEpisode } from 'show-episode-format';

import { getMarks } from '../../api';

export default React.createClass({
  getInitialState() {
    return {
      marks: [],
      isLoading: false,
      hasMore: true
    };
  },
  loadMore() {
    this.setState({
      isLoading: true
    });

    const since = this.state.marks.length > 0 ?
      this.state.marks[this.state.marks.length - 1]._key : undefined;

    return getMarks(since)
      .then(marks => {
        const xs = this.state.marks.length > 0 ?
          this.state.marks.concat(marks) : marks;

        this.setState({ marks: xs, isLoading: false, hasMore: marks.length > 0 })
      })
      .catch(err => {
        console.log(err.stack || err);
        this.setState({ isLoading: false, hasMore: false });
      });
  },
  render() {
    const { marks, isLoading, hasMore } = this.state;

    return (
      <div className={themeStyles.container}>
        <InfiniteScroll
            pageStart={0}
            loadMore={this.loadMore}
            hasMore={!isLoading && hasMore}
            loader={<div className="loader">Loading ...</div>}
            useWindow={false}>

          {marks.map(renderMark)}

        </InfiniteScroll>
      </div>
    );
  }
});

function renderMark(mark, index) {
  return (
    <div key={index}>
      <div>{`${mark.title} ${formatEpisode(mark.s, mark.ep)}`}</div>
      <div>{mark.marks.length} marks</div>
    </div>
  );
}
