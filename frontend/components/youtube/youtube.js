import React from 'react';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import { connect } from 'react-redux';

import { changeUrl } from '../../actions/youtube-actions';
import { reactRouterPropTypes } from '../../schema/react-router';
import { schema } from '../../reducers/youtube-reducer';

const mapStateToProps = state => ({ youtube: state.youtube });
const mapDispatchToProps = { onChangeUrl: changeUrl };

const YoutubeInput = React.createClass({
  propTypes: propTypes({
    ...reactRouterPropTypes,
    children: t.Nil,

    youtube: schema,
    onChangeUrl: t.Function
  }),
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
