import React from 'react';
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

const MediaList = React.createClass({
  handleClick: function(index) {
    const file = this.props.files[index];

    if (file.db) {
      api.playFile(file.file, file.db);
    } else {
      this.props.openModal(file);
    }
  },
  handleHistoryClick: function(index) {
    const file = this.props.files[index];
    api.addToHistory(file.file, file.db);
  },
  render: function() {
    return (
			<div>
				{this.props.files.map((item, index) => {
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

					return (
						<div className="file-entry"
								 key={file}
								 tabIndex={index + 1}>

              <div>
                <a className="title" onClick={this.handleClick.bind(this, index)}>
                  { title }
                </a>
                <div className="fullpath">
                  { progress && (
                    <span className={progressClass}>
                      { progress + '%' }
                    </span>
                  ) }
                  {' '}
                  {
                    item.db && item.db.scrobble && (
                      <span className="scrobble">[Scrobble]</span>
                    ) || (
                      <a onClick={this.handleHistoryClick.bind(this, index)}>
                        [Add To History]
                      </a>
                    )
                  }
                  {' '}
                  <span>{ file }</span>
                </div>
              </div>

              <div className="children">
                <MediaList files={item.contents || []} openModal={this.props.openModal} />
              </div>
						</div>
					);
				})}
			</div>
    );
	}
});

export default MediaList;
