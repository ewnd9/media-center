import React from 'react';
import styles from './theme.css';

import MediaList from './media-list';

export default React.createClass({
  getInitialState: function() {
    return {
      mode: localStorage.mode || 'all'
    };
  },
  setMode: function(mode) {
    localStorage.mode = mode;
    this.setState({ mode });
  },
  render: function() {
    return (
      <div>
        <div className="top-options-wrapper">
          <div className={styles.buttons} role="group">
            <button type="button"
                    onClick={this.setMode.bind(this, 'all')}
                    className={`${styles.button} ${this.state.mode === 'all' ? styles.activeButton : ''}`}>
              All
            </button>
            <button type="button"
                    onClick={this.setMode.bind(this, 'not-watched')}
                    className={`${styles.button} ${this.state.mode === 'not-watched' ? styles.activeButton : ''}`}>
              Not Watched
            </button>
          </div>
        </div>

        <MediaList openModal={this.props.openModal} files={this.props.files} level={0} mode={this.state.mode} />
      </div>
    );
  }
});
