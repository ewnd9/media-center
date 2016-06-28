import React from 'react';

import Spinner from '../ui/spinner/spinner';
import { connect } from 'react-redux';

import { fetchTraktReport } from '../../actions/trakt-report-actions';
import TraktReportItem from './trakt-report-item';

const mapStateToProps = ({ traktReport: { isFetching, report } }) => ({ isFetching, report });
const mapDispatchToProps = { fetchTraktReport };

const TraktReport = React.createClass({
  componentDidMount: function() {
    this.props.fetchTraktReport();
  },
  render: function() {
    const { isFetching, report } = this.props;

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

    const renderGroup = group => group.map(({ show, showIds, titles }) => {
      return (
        <TraktReportItem show={show} showIds={showIds} titles={titles} key={show} />
      );
    });

    if (report != null && !isFetching) {
      return (
        <div>
          { renderReport(report) }
        </div>
      );
    } else {
      return <Spinner />;
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(TraktReport);
