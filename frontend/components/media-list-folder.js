import React from 'react';
import MediaListItem from './media-list-item';

export default React.createClass({
  getInitialState: function() {
    const val = localStorage[this.getLocalStorageKey()];
    return { hidden: typeof val !== 'undefined' ? val === 'true' : true };
  },
  toggleHidden: function() {
    this.setState({ hidden: !this.state.hidden });
    localStorage[this.getLocalStorageKey()] = !this.state.hidden;
  },
  getLocalStorageKey: function() {
    return `folder:${this.props.file.dir}`;
  },
  render: function() {
		const { level, file } = this.props;
    const fSummary = file.summary;

		const summary = fSummary.map(({ title, data }) => {
			if (typeof data === 'boolean') {
				return title;
			} else {
				return (fSummary.length === 1 ? `(${data.scrobble} / ${data.count}) ` : '') + title;
			}
		}).join(', ');

    if (fSummary.length === 1 && fSummary[0].data.scrobble > 0 && fSummary[0].data.scrobble === fSummary[0].data.count && this.props.mode === 'not-watched') {
      return null;
    }

    const childs = file.media.map((media, index) => {
      return (
        <MediaListItem key={index}
                       file={media}
                       index={index}
                       level={level + 1}
                       mode={this.props.mode}
                       openModal={this.props.openModal} />
      );
    })

		return (
			<div className={`file-entry level-${level}`}>
				<a className="title" onClick={this.toggleHidden}>{summary}</a>
				{
					!this.state.hidden && childs || ''
				}
			</div>
		);
	}
});
