import React from 'react';
import styles from './style.css';

import moment from 'moment';
import { formatTitle } from '../../../utils';

export default React.createClass({
  handleClick(file, position) {
    const { playFile, openModal } = this.props;

    if (file.db) {
      playFile(file.file, file.db, position);
    } else {
      openModal(file);
    }
  },
  handleHistoryClick(file) {
    const { addToHistory } = this.props;
    addToHistory(file);
  },
  render() {
    const {
      file: item,
      index,
      openModal
    } = this.props;

    const file = item.fileName || item.dir;
    const data = file.split('/');

    let title;
    let progress;
    let progressClass;
    let streamUrlParts = [];

    if (item.db) {
      title = formatTitle(item.db);
      streamUrlParts.push(`title=${encodeURIComponent(title)}`);

      if (item.db.position) {
        progress = parseInt((item.db.position / item.db.duration) * 100);
        progressClass = `progress progress-${ progress < 80 ? 'incomplete' : 'complete' }`;

        streamUrlParts.push(`position=${encodeURIComponent(item.db.position)}`);
        streamUrlParts.push(`duration=${encodeURIComponent(item.db.duration)}`);
      }
    } else if (item.recognition) {
      title = '? ' + formatTitle(item.recognition);
    } else {
      title = data[data.length - 1];
    }

    if (item.db && item.db.scrobbleAt && !item.db.scrobbleAtDiff) {
      item.db.scrobbleAtDiff = moment(item.db.scrobbleAt).fromNow();
    }

    return (
      <div className={`${styles.file} ${styles.file}`}
           key={file}
           tabIndex={index + 1}>

        <div>
          <div>
            <a onClick={this.handleClick.bind(this, item, undefined)}>
              { title }
            </a>
            <span className={`glyphicon glyphicon-film ${styles.fileIcon}`} />
          </div>
          <div className={styles.filePath}>
            { progress && (
              <a className={progressClass} onClick={this.handleClick.bind(this, item, item.db.position)}>
                { progress + '%' }
              </a>
            ) || ''}
            {' '}
            <span>{ file }</span>
            {' '}
            {
              item.db && item.db.scrobble && (
                <span className="scrobble">
                  [Scrobble] ({item.db.scrobbleAtDiff})
                </span>
              ) || (
                <span>
                  <a onClick={openModal.bind(null, item)}>
                    [Change Media]
                  </a>
                  {' '}
                  <a onClick={this.handleHistoryClick.bind(this, item)}>
                    [Add To History]
                  </a>
                </span>
              )
            }
            { item.streamUrl && (
              <a target="_blank" href={`${item.streamUrl}#${streamUrlParts.join('&')}`}>
                [Stream]
              </a>
            ) || '' }
          </div>
        </div>

      </div>
    );
  }
});
