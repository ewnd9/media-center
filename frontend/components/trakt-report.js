import React from 'react';
import Spinner from 'react-spinkit';

import * as api from './../api';
import TraktReportItem from './trakt-report-item';

export default React.createClass({
  getInitialState: () => ({
    loaded: false
  }),
  getReport: function() {
    api
      .getReport()
      .then(report => this.setState({ report, loaded: true }));
  },
  componentDidMount: function() {
    this.getReport();
  },
  render: function() {
    if (this.state.loaded) {
      return (
        <div>
          {
            this.state.report.map(({ report, show }) => {
              return (
                <TraktReportItem report={report} show={show} key={show} />
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
