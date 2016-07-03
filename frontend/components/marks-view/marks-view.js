import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import { fetchMark, addMark, showTooltip } from '../../actions/mark-actions';
import ControlPanel from './control-panel/control-panel';
import Spinner from '../ui/spinner/spinner';

import ToolTip from 'react-portal-tooltip';

const mapStateToProps = ({ mark: { mark, lines, isFetching, activeTooltipId } }) =>
  ({ mark, lines, isFetching, activeTooltipId });
const mapDispatchToProps = { fetchMark, addMark, showTooltip };

export const MarksView = React.createClass({
  getInitialState() {
    return { active: 0 };
  },
  componentDidMount() {
    const { params: { id } } = this.props;
    this.props.fetchMark(id.replace(/-/g, ':'));
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
  renderLine(subtitles, index) {
    const { showTooltip, activeTooltipId } = this.props;
    let i = 0;

    const getTerms = sentence => sentence.map(term => {
      const id = `term-${index}-${i++}`;
      const isSelected = activeTooltipId && activeTooltipId === id;

      // @TODO got a bug on probably with a race condition on rendering all without condition

      return (
        <span>
          {term.whitespace.preceding || ''}
          <span
            id={id}
            onClick={showTooltip.bind(null, id)}
            className={`${styles.term} ${isSelected && styles.selected || ''}`}>
            {term.text}
          </span>
          { isSelected &&  (
            <ToolTip active={isSelected} position="bottom" arrow="center" parent={`#${id}`}>
              <div className={styles.tooltip}>
                <p><b>{term.normal}</b></p>
                <p>{Object.keys(term.pos).join(', ')}</p>
              </div>
            </ToolTip>
          ) || ''}

          {term.whitespace.trailing || ''}
        </span>
      );
    });

    const getSentences = line => line.map(sentence => getTerms(sentence));

    const lines = subtitles.text
      .map((line, index) => (
        <div key={index}>
          { getSentences(line) }
        </div>
      ));

    return (
      <div key={subtitles.startTimeMs} className={styles.line}>
        <div className={styles.time}>{subtitles.startTime} -> {subtitles.endTime}</div>
        { lines }
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
          lines.map((line, index) => line.startTime ?
            this.renderLine(line, index) :
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
