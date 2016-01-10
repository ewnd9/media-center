import React from 'react';
import moment from 'moment';
import * as api from './../api';

const tr = (s) => s.length < 2 ? '0' + s : s;

const format = (data) => {
  let result = data.title;

  if (data.year) {
    result = result + ` (${data.year})`;
  }

  if (data.s) {
    result = result + ` S${tr(data.s + '')}`;
  }

  if (data.ep) {
    result = result + `E${tr(data.ep + '')}`;
  }

  return result;
};

export default React.createClass({
  handleClick: function(file, position) {
    if (file.db) {
      api.playFile(file.file, file.db, position);
    } else {
      this.props.openModal(file);
    }
  },
  handleHistoryClick: function(file) {
    api.addToHistory(file.file, file.db);
  },
  render: function() {
		const item = this.props.file;
		const index = this.props.index;

		const file = item.filename || item.dir;
		const data = file.split('/');

		let title;
		let progress;
		let progressClass;

		if (item.db) {
			title = format(item.db);

			if (item.db.position) {
				progress = parseInt((item.db.position / item.db.duration) * 100);
				progressClass = `progress progress-${ progress < 80 ? 'incomplete' : 'complete' }`;
			}
		} else if (item.recognition) {
			title = '? ' + format(item.recognition);
		} else {
			title = data[data.length - 1];
		}

		if (item.db && item.db.scrobbleAt && !item.db.scrobbleAtDiff) {
			item.db.scrobbleAtDiff = moment(item.db.scrobbleAt).fromNow();
		}

		const level = this.props.level || 0;

    if (item.db && item.db.scrobble && this.props.mode === 'not-watched') {
      return null;
    }

		return (
			<div className={`file-entry level-${level}`}
					 key={file}
					 tabIndex={index + 1}>

				<div>
					<a className="title" onClick={this.handleClick.bind(this, item, undefined)}>
						{ title }
					</a>
					<div className="fullpath">
						{ progress && (
							<a className={progressClass} onClick={this.handleClick.bind(this, item, item.db.position)}>
								{ progress + '%' }
							</a>
						) }
						{' '}
						{
							item.db && item.db.scrobble && (
								<span className="scrobble">
									[Scrobble] ({item.db.scrobbleAtDiff})
								</span>
							) || (
								<a onClick={this.handleHistoryClick.bind(this, item)}>
									[Add To History]
								</a>
							)
						}
						{' '}
						<span>{ file }</span>
					</div>
				</div>

			</div>
		);
	}
});
