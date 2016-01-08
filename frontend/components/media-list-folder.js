import React from 'react';
import * as api from './../api';
import MediaListItem from './media-list-item';
import MediaList from './media-list';

export default React.createClass({
  getInitialState: function() {
    return { hidden: true };
  },
  toggleHidden: function() {
    this.setState({ hidden: !this.state.hidden });
  },
  render: function() {
		const level = this.props.level;
		const item = this.props.file;

		const summary = item.summary.map(({ title, data }) => {
			if (typeof data === 'boolean') {
				return title;
			} else {
				return (item.summary.length ? `(${data.scrobble} / ${data.count}) ` : '') + title;
			}
		}).join(', ');

		return (
			<div className={`file-entry level-${level + 1}`}>
				<a className="title" onClick={this.toggleHidden}>{summary}</a>
				{
					!this.state.hidden && (
						<MediaList files={item.contents} level={level + 2} openModal={this.props.openModal} />
					)
				}
			</div>
		);
	}
});
