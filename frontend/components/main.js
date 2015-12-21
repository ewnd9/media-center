import fetch from 'isomorphic-fetch';

import React from 'react';

const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

const el = React.createClass({
  getInitialState: () => ({ files: [] }),
  getFiles: function() {
    fetch(baseUrl + '/api/v1/files')
      .then(response => response.json())
      .then((files) => this.setState({ files }));
  },
  componentDidMount: function() {
    this.getFiles();

  },
  handleClick: function(index) {
    const file = this.state.files[index];

    fetch(baseUrl + '/api/v1/playback/start', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: file
      })
    });
  },
  render: function() {
    return (
			<div>
				{this.state.files.map((file, index) => {
					const data = file.split('/');
					const title = data[data.length - 1];

					return (
						<div className="file-entry"
								 key={file}
								 tabIndex={index + 1}
                 onClick={this.handleClick.bind(this, index)}>
							<a className="title">{ title }</a>
							<a className="fullpath">{ file }</a>
						</div>
					);
				})}
			</div>
    );
	}
});

export default el;
