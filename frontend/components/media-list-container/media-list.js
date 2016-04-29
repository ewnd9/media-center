import React from 'react';
import MediaListItem from './media-list-item';
import MediaListFolder from './media-list-folder';

const MediaList = React.createClass({
  render: function() {
    return (
      <div>
        {
          this.props.files.map((item, index) => {
            const level = this.props.level;

            if (item.media.length > 1) {
              return (
                <MediaListFolder key={index}
                                 file={item}
                                 level={level + 1}
                                 mode={this.props.mode}
                                 openModal={this.props.openModal} />
              );
            } else {
              return (
                <MediaListItem key={index}
                               file={item.media[0]}
                               index={index}
                               level={level + 1}
                               mode={this.props.mode}
                               rightToLeft={this.props.rightToLeft}
                               openModal={this.props.openModal} />
              );
            }
          })
        }
      </div>
    );
  }
});

export default MediaList;
