import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import { fetchMark, addMark, showTooltip } from '../../actions/mark-actions';
import ControlPanel from './control-panel/control-panel';
import Spinner from '../ui/spinner/spinner';

import ToolTip from 'react-portal-tooltip';

const mapStateToProps = ({ mark: { mark, lines, isFetching, activeTooltipId, activeBlockIndex } }) =>
  ({ mark, lines, isFetching, activeTooltipId, activeBlockIndex });
const mapDispatchToProps = { fetchMark, addMark, showTooltip };

export const SubtitlesBlock = React.createClass({
  shouldComponentUpdate(nextProps) {
    const { activeBlockIndex: currIndex, blockIndex: index } = this.props;
    const { activeBlockIndex: nextIndex } = nextProps;

    return (
      nextIndex === index ||
      (currIndex === index && nextIndex !== index)
    );
  },
  renderTerm(term, id, isSelected, showTooltip) {
    // @TODO got a bug on probably with a race condition on rendering all without condition
    return (
      <span key={id}>
        {term.whitespace.preceding || ''}
        <span
          id={id}
          onClick={showTooltip}
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
  },
  render() {
    const { block, blockIndex, activeTooltipId, showTooltip } = this.props;

    return (
      <div key={block.startTimeMs} className={styles.line}>
        <div className={styles.time}>{block.startTime} -> {block.endTime}</div>
        { block.text
            .map((line, lineIndex) => (
              <div key={lineIndex}>
                { line.map((sentence, sentenceIndex) => (
                    <span key={sentenceIndex}>
                      { sentence.map((term, termIndex) => {
                          const id = `term-${[blockIndex, lineIndex, sentenceIndex, termIndex].join('-')}`;
                          const isSelected = activeTooltipId && activeTooltipId === id;

                          return this.renderTerm(term, id, isSelected, showTooltip.bind(null, id, blockIndex));
                        })
                      }
                    </span>
                  )) }
              </div>
            ))
        }
      </div>
    );
  }
});

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
  renderBlock(block, blockIndex) {
    const { activeTooltipId, activeBlockIndex, showTooltip } = this.props;

    return (
      <SubtitlesBlock
        key={blockIndex}
        block={block}
        blockIndex={blockIndex}
        activeTooltipId={activeTooltipId}
        activeBlockIndex={activeBlockIndex}
        showTooltip={showTooltip} />
    );
  },
  renderMark(line) {
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
    const { mark, isFetching } = this.props;
    const { active } = this.state;

    if (isFetching || !mark) {
      return <Spinner />;
    }

    return (
      <div className={styles.container}>
        {
          mark.subtitles.map((block, blockIndex) => block.startTime ?
            this.renderBlock(block, blockIndex) :
            this.renderMark(block)
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
