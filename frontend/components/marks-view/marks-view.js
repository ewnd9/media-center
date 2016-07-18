import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import {
  fetchMark,
  addMark,
  showTooltip,
  showTooltipAndFetchTranslations,
  saveWord,
  deleteWord
} from '../../actions/mark-actions';

import ControlPanel from './control-panel/control-panel';
import Spinner from '../ui/spinner/spinner';
import InteractiveSubtitles from './interactive-subtitles/interactive-subtitles';

const mapStateToProps = ({ mark: { mark, lines, isFetching, activeTooltipId, activeBlockIndex, words, translations } }) =>
  ({ mark, lines, isFetching, activeTooltipId, activeBlockIndex, words, translations });
const mapDispatchToProps = { fetchMark, addMark, showTooltip, showTooltipAndFetchTranslations, saveWord, deleteWord };

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
    const {
      activeTooltipId,
      activeBlockIndex,
      showTooltip,
      showTooltipAndFetchTranslations,
      saveWord,
      deleteWord,
      words,
      translations,
      mark: { imdb, s, ep }
    } = this.props;

    const source = { imdb, s, ep };

    return (
      <InteractiveSubtitles
        key={blockIndex}
        block={block}
        blockIndex={blockIndex}
        source={source}
        words={words}
        saveWord={saveWord}
        deleteWord={deleteWord}
        translations={translations}
        activeTooltipId={activeTooltipId}
        activeBlockIndex={activeBlockIndex}
        showTooltip={showTooltip}
        showTooltipAndFetchTranslations={showTooltipAndFetchTranslations} />
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
