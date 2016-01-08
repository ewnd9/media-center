import React from 'react';
import * as api from './../api';
import MediaListItem from './media-list-item';
import MediaListFolder from './media-list-folder';

const MediaList = React.createClass({
  render: function() {
    return (
			<div>
				{
          this.props.files.map((item, index) => {
            const level = this.props.level;

            if (item.contents) {
              return (
                <MediaListFolder key={index} file={item} level={level} openModal={this.props.openModal} />
              );
            } else {
              return (<MediaListItem key={index} file={item} index={index} level={level + 1} openModal={this.props.openModal} />);
            }
          })
        }
			</div>
    );
	}
});

export default MediaList;
