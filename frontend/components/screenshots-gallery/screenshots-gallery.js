import React from 'react';
import styles from './style.css';

import Spinner from 'react-spinkit';

import * as api from './../../api';

export default React.createClass({
  getInitialState: () => ({
    loaded: false
  }),
  getScreenshots: function() {
    api
      .getScreenshots()
      .then(({ files }) => {
        this.setState({ screenshots: files, loaded: true });
      });
  },
  componentDidMount: function() {
    this.getScreenshots();
  },
  render: function() {
    if (this.state.loaded) {
      return (
        <div className={`${styles.gallery}`}>
          {
            this.state.screenshots.map(url => {
              return (
                <div key={url} className={styles.screenshot}>
                  <img src={`${api.baseUrl}/screenshots/${url}`} />
                </div>
              );
            })
          }
        </div>
      );
    } else {
      const style = {
        height: '200px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };

      return (
        <Spinner spinnerName="three-bounce" noFadeIn style={style} />
      );
    }
  }
});
