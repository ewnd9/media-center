import React from 'react';
import MediaListFolder from './media-list-folder';

const MediaList = React.createClass({
  render: function() {
    return (
      <div>
        {
          this.props.files.map((item, index) => {
            return (
              <MediaListFolder
                key={index}
                file={item}
                mode={this.props.mode}
                openModal={this.props.openModal} />
            );
          })
        }
      </div>
    );
  }
});

export default MediaList;
