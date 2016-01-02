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

              <div onClick={this.handleClick.bind(this, index)}>
                <a className="title">{ title }</a>
                <a className="fullpath">
                  { progress && (
                    <span className={progressClass}>
                      { progress + '%' }
                    </span>
                  ) }
                  { ' ' }
                  <span>{ file }</span>
                </a>
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
