import React from 'react';

import Spinner from '../ui/spinner/spinner';

import * as api from '../../api';
import TraktReportItem from './trakt-report-item';

export default React.createClass({
  getInitialState: () => ({
    loaded: false
  }),
  getReport: function() {
    api
      .getReport()
      .then(report => this.setState({ report: report.filter(_ => _.length > 0), loaded: true }));
  },
  componentDidMount: function() {
    this.getReport();
  },
  render: function() {
    const renderReport = report => report.map((group, index) => {
      if (index > 0) {
        return (
          <div key={index}>
            <hr />
            { renderGroup(group) }
          </div>
        );
      } else {
        return renderGroup(group);
      }
    });

    const renderGroup = group => group.map(({ report, show }) => {
      return (
        <TraktReportItem report={report} show={show} key={show} />
      );
    });

    if (this.state.loaded) {
      return (
        <div>
          { renderReport(this.state.report) }
        </div>
      );
    } else {
      return <Spinner />;
    }
  }
});
