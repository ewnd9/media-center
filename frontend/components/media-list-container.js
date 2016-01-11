import React from 'react';
import MediaList from './media-list';
import * as api from './../api';
import { STOP_PLAYBACK } from './../constants';

export default React.createClass({
  getInitialState: function() {
    return {
      files: [],
      mode: localStorage.mode || 'all'
    };
  },
  getFiles: function() {
    api.findFiles().then((files) => this.setState({ files }));
  },
  componentDidMount: function() {
    this.props.socket.on(STOP_PLAYBACK, () => this.getFiles());
    this.getFiles();
  },
  setMode: function(mode) {
    localStorage.mode = mode;
    this.setState({ mode });
  },
  render: function() {
    return (
      <div>
        <div id="top-options" className="btn-group btn-group-sm" role="group">
          <button type="button"
                  onClick={this.setMode.bind(this, 'all')}
                  className={`btn btn-default ${this.state.mode === 'all' ? 'active' : ''}`}>
            All
          </button>
          <button type="button"
                  onClick={this.setMode.bind(this, 'not-watched')}
                  className={`btn btn-default ${this.state.mode === 'not-watched' ? 'active' : ''}`}>
            Not Watched
          </button>
        </div>

        <MediaList openModal={this.props.openModal} files={this.state.files} level={0} mode={this.state.mode} />
      </div>
    );
  }
});
