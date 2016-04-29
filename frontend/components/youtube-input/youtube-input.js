import React from 'react';

import { playYoutubeLink } from '../../api';

const regexps = [
  /youtu\.be\/([\w-]+)$/,
  /youtube.com\/.*v=([\w-]+).*$/
];

const STATE_INIT = '';
const STATE_SUCCESS = 'has-success';
const STATE_ERROR = 'has-error';

export default React.createClass({
  getInitialState() {
    return { status: STATE_INIT };
  },
  onChange(e) {
    let id;

    for (let regex of regexps) {
      const match = regex.exec(e.target.value);

      if (match) {
        id = match[1];
        break;
      }
    }

    if (id) {
      this.setState({ status: STATE_SUCCESS });
      playYoutubeLink(`https://www.youtube.com/watch?v=${id}`);
    } else {
      this.setState({ status: STATE_ERROR });
    }
  },
  render() {
    return (
      <div className={`form-group ${this.state.status}`}>
        <label htmlFor="youtube-input">Youtube link</label>
        <input type="text" className="form-control" id="youtube-input" placeholder="Youtube link" onChange={this.onChange} />
      </div>
    );
  }
});
