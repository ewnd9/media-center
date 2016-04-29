import React from 'react';
import styles from '../theme.css';

import ScreenshotsGallery from './../screenshots-gallery/screenshots-gallery';
import TraktReport from './../trakt-report';

const REPORT = 'REPORT';
const SCREENSHOTS = 'SCREENSHOTS';

const buttons = [
  { label: 'Upcoming', value: REPORT },
  { label: 'Screenshots', value: SCREENSHOTS }
];

export default React.createClass({
  getInitialState: () => ({
    mode: REPORT
  }),
  setMode: function(mode) {
    this.setState({ mode });
  },
  render: function() {
    const component = this.state.mode === REPORT ? (<TraktReport />) : (<ScreenshotsGallery />);

    return (
      <div>
        <div className={styles.buttons} role="group">
          {
            buttons.map(({ label, value }) => {
              return (
                <button type="button"
                        onClick={this.setMode.bind(this, value)}
                        key={value}
                        className={`${styles.button} ${this.state.mode === value ? styles.activeButton : ''}`}>
                  { label }
                </button>
              );
            })
          }
        </div>

        { component }
      </div>
    );
  }
});
