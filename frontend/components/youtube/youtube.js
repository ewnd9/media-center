import React from 'react';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import {
  STATE_INIT,
  STATE_SUCCESS,
  STATE_ERROR,
  changeUrl
} from '../../actions/youtube-actions';

import { connect } from 'react-redux';

const mapStateToProps = state => ({ youtube: state.youtube });
const mapDispatchToProps = { onChangeUrl: changeUrl };

const YoutubeInput = React.createClass({
  propTypes: propTypes({
    youtube: t.struct({
      status: t.enums.of([STATE_INIT, STATE_SUCCESS, STATE_ERROR], 'State'),
      url: t.maybe(t.String)
    }),
    onChangeUrl: t.Function
  }, { strict: false } ),
  render() {
    const { youtube: { status, url }, onChangeUrl } = this.props;

    return (
      <div className={`form-group ${status}`}>
        <label htmlFor="youtube-input">Youtube link</label>

        <input
          type="text"
          value={url}
          className="form-control"
          id="youtube-input"
          placeholder="Youtube link"
          onChange={e => onChangeUrl(e.target.value)} />
      </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(YoutubeInput);
