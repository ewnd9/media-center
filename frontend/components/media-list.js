import React from 'react';
import * as api from './../api';

export default React.createClass({
  getInitialState: () => ({ files: [] }),
  getFiles: function() {
    api.findFiles().then((files) => this.setState({ files }));
  },
  componentDidMount: function() {
    this.getFiles();
  },
  handleClick: function(index) {
    const file = this.state.files[index];
    this.props.openModal(file);
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
