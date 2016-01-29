import React from 'react';
import _ from 'lodash';
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
      .then((report) => {
        const reportArray = _.map(report, (report, show) => ({ show, report }));

        const reportSorted = reportArray.sort((obj1, obj2) => {
          const getFirstFuture = obj => obj.report.future.length > 0 && obj.report.future[0].episodes[0].first_aired || undefined;

          const first1 = getFirstFuture(obj1);
          const first2 = getFirstFuture(obj2);

          if (typeof first1 === 'undefined' && typeof first2 === 'undefined') {
            return 0;
          }

          if (typeof first1 === 'undefined' && typeof first2 !== 'undefined') {
            return 1;
          }

          if (typeof first1 !== 'undefined' && typeof first2 === 'undefined') {
            return -1;
          }

          return new Date(first1) - new Date(first2);
        });

        this.setState({ report: reportSorted, loaded: true });
      });
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
