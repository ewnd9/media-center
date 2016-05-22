import React from 'react';
import styles from './style.css';

import { MEDIA_LIST_UNWATCHED } from '../../constants';

import MediaListItem from './media-list-item';

const ChildrenContainer = React.createClass({
  getInitialState() {
    return { height: 0 };
  },
  componentWillLeave(callback) {
    this.el.style.height = '0px';
    setTimeout(callback, 200); // hardcode from styles.filesList
  },
  componentDidMount() {
    this.el.style.height = '0px';
    this.setState({ height: this.el.scrollHeight });
  },
  setRef(el) {
    if (el) {
      this.el = el;
    }
  },
  render() {
    const {
      rightToLeft,
      openModal,
      mode,
      activeChilds
    } = this.props;

    const style = {
      height: `${this.state.height}px`
    };

    const isUnwatched = mode === MEDIA_LIST_UNWATCHED;

    return (
      <div
        className={styles.filesList}
        ref={this.setRef}
        style={style}>
        {
          activeChilds
            .filter(media => {
              return !isUnwatched || !media.watched;
            })
            .map((media, index) => {
              return (
                <MediaListItem
                  key={index}
                  file={media}
                  index={index}
                  rightToLeft={rightToLeft}
                  openModal={openModal} />
              );
            })
        }
      </div>
    );
  }
});

export default ChildrenContainer;
