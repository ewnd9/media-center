import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';
import { fetchScreenshots } from '../../actions/screenshots-actions';

import { baseUrl } from '../../api';
import Spinner from '../ui/spinner/spinner';

function mapStateToProps(state) {
  const { screenshots } = state;

  return {
    screenshots
  };
}

export const ScreenshotsGallery = React.createClass({
  componentDidMount: function() {
    this.props.dispatch(fetchScreenshots());
  },
  render: function() {
    const { screenshots: { screenshots, isFetching } } = this.props;

    if (!isFetching) {
      return (
        <div className={`${styles.imageContainer} clearfix`}>
          {
            screenshots.map(url => {
              return (
                <div key={url} className={styles.screenshot}>
                  <img src={`${baseUrl}/screenshots/${url}`} />
                </div>
              );
            })
          }
        </div>
      );
    } else {
      return <Spinner />;
    }
  }
});

export default connect(mapStateToProps)(ScreenshotsGallery);
