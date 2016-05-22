import React from 'react';
import styles from './style.css';
import theme from '../theme.css';

import moment from 'moment';
import * as api from '../../api';
import { formatTitle } from '../../utils';

export default React.createClass({
  handleClick: function(file, position) {
    if (file.db) {
      api.playFile(file.file, file.db, position);
    } else {
      this.openModal(file);
    }
  },
  handleHistoryClick: function(file) {
    api.addToHistory(file.file, file.db);
  },
  openModal: function(file) {
    this.props.openModal(file);
  },
  render: function() {
    const item = this.props.file;
    const index = this.props.index;
    const rightToLeft = this.props.rightToLeft;

    const file = item.fileName || item.dir;
    const data = file.split('/');

    let title;
    let progress;
    let progressClass;

    if (item.db) {
      title = formatTitle(item.db);

      if (item.db.position) {
        progress = parseInt((item.db.position / item.db.duration) * 100);
        progressClass = `progress progress-${ progress < 80 ? 'incomplete' : 'complete' }`;
      }
    } else if (item.recognition) {
      title = '? ' + formatTitle(item.recognition);
    } else {
      title = data[data.length - 1];
    }

    if (item.db && item.db.scrobbleAt && !item.db.scrobbleAtDiff) {
      item.db.scrobbleAtDiff = moment(item.db.scrobbleAt).fromNow();
    }

    if (this.props.mode === 'not-watched' && item.db && (item.db.scrobble || item.db.hidden)) {
      return null;
    }

    return (
      <div className={`${styles.file} ${rightToLeft && theme.textAlignRight || ''} ${styles.file}`}
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
                  <a onClick={this.openModal.bind(this, item)}>
                    [Change Media]
                  </a>
                  {' '}
                  <a onClick={this.handleHistoryClick.bind(this, item)}>
                    [Add To History]
                  </a>
                </span>
              )
            }
          </div>
        </div>

      </div>
    );
  }
});
