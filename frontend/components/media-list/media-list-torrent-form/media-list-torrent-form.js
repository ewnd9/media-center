import React from 'react';
import styles from './style.css';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import { postTorrentMagnet } from '../../../actions/torrents-actions';
import { connect } from 'react-redux';

const mapDispatchToProps = { postTorrentMagnet };

const MediaListTorrentForm = React.createClass({
  propTypes: propTypes({
    postTorrentMagnet: t.Function
  }),
  onSubmit(e) {
    const { postTorrentMagnet } = this.props;

    e.preventDefault();
    const magnet = this.refs.magnetInput.value;

    postTorrentMagnet(magnet)
      .then(() => {
        this.refs.magnetInput.value = '';
      });
  },
  render() {
    return (
      <div className={`input-group ${styles.container}`} style={{padding: '20px'}}>
        <input type="text" className="form-control" ref="magnetInput" placeholder="Magnet Link" />
        <span className="input-group-btn">
          <button className="btn btn-default" type="button" onClick={this.onSubmit}>
            Go!
          </button>
        </span>
      </div>
    );
  }
});

export default connect(null, mapDispatchToProps)(MediaListTorrentForm);
