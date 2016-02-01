import React from 'react';

import ScreenshotsGallery from './../screenshots-gallery/screenshots-gallery';
import TraktReport from './../trakt-report';

const REPORT = 'REPORT';
const SCREENSHOTS = 'SCREENSHOTS';

const buttons = [
  { label: 'Trakt Report', value: REPORT },
  { label: 'Screenshots', value: SCREENSHOTS }
]

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
        <div id="top-options" className="btn-group btn-group-sm" role="group">
          {
            buttons.map(({ label, value }) => {
              return (
                <button type="button"
                        onClick={this.setMode.bind(this, value)}
                        key={value}
                        className={`btn btn-default ${this.state.mode === value ? 'active' : ''}`}>
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
