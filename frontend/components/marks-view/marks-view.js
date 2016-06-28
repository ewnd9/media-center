import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';
import sanitize from 'sanitize-html';

import { fetchMark, addMark } from '../../actions/mark-actions';
import ControlPanel from './control-panel/control-panel';
import Spinner from '../ui/spinner/spinner';

const mapStateToProps = ({ mark: { mark, lines, isFetching } }) => ({ mark, lines, isFetching });
const mapDispatchToProps = { fetchMark, addMark };

export const MarksView = React.createClass({
  getInitialState() {
    return { active: 0 };
  },
  componentDidMount() {
    const { params: { id } } = this.props;
    this.props.fetchMark(id.replace(/-/g, ':'));
  },
  getLineHTML(text) {
    return {
      __html: sanitize(text, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
      })
    };
  },
  setCurrentFocusRef(startTimeMs, el) {
    if (!el) {
      return;
    }

    this.marksElements = this.marksElements || {};
    this.marksElements[startTimeMs] = el;

    if (!this.props.mark || !el) {
      return;
    }

    const { marks } = this.props.mark;

    if (!this.isInit && el && Object.keys(this.marksElements).length === marks.length) { // doesn't affect rendering
      this.isInit = true;
      this.focusActive(0);
    }
  },
  focusActive(active) {
    const { marks } = this.props.mark;

    const current = marks[active];
    const focusElement = this.marksElements[current.position / 1000];
    window.scroll(0, focusElement.offsetTop - 200);
  },
  clickNext() {
    const { active } = this.state;
    const { marks } = this.props.mark;

    const next = (active + 1) % marks.length;

    this.focusActive(next);
    this.setState({ active: next });
  },
  renderLine(line) {
    return (
      <div key={line.startTimeMs} className={styles.line}>
        <div className={styles.time}>{line.startTime} -> {line.endTime}</div>
        <div dangerouslySetInnerHTML={this.getLineHTML(line.text)} />
      </div>
    );
  },
  renderCurrentFocus(line) {
    return (
      <div
        key={line.startTimeMs}
        className={styles.line}
        ref={this.setCurrentFocusRef.bind(this, line.startTimeMs)}>
        ----
      </div>
    );
  },
  render() {
    const { isFullWidth } = this.props.route;
    const { mark, isFetching, lines } = this.props;
    const { active } = this.state;

    if (isFetching || !mark) {
      return <Spinner />;
    }

    return (
      <div className={styles.container}>
        {
          lines.map(line => line.startTime ?
            this.renderLine(line) :
            this.renderCurrentFocus(line)
          )
        }

        <ControlPanel
          isFullWidth={isFullWidth}
          marks={mark.marks}
          active={active}
          clickNext={this.clickNext} />
      </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MarksView);
