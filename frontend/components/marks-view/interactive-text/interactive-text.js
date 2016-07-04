import React from 'react';
import styles from './style.css';

import ToolTip from 'react-portal-tooltip';
import IconButton from '../../ui/icon-button/icon-button';

function termToString(term) {
  return `${term.whitespace.preceding || ''}${term.text}${term.whitespace.trailing || ''}`;
}

const InteractiveText = React.createClass({
  shouldComponentUpdate(nextProps) {
    const { activeBlockIndex: currIndex, blockIndex: index } = this.props;
    const { activeBlockIndex: nextIndex } = nextProps;

    return (
      nextIndex === index ||
      (currIndex === index && nextIndex !== index)
    );
  },
  renderTerm(term, id, isSelected, savedId, onClick, deleteWord) {
    // @TODO got a bug on probably with a race condition on rendering all without condition
    return (
      <span key={id}>
        {term.whitespace.preceding || ''}
        <span
          id={id}
          onClick={onClick}
          className={`${styles.term} ${isSelected && styles.selected || (savedId && styles.savedHighlight || '')}`}>
          {term.text}
        </span>
        { isSelected &&  (
          <ToolTip active={isSelected} position="bottom" arrow="center" parent={`#${id}`}>
            <div className={styles.tooltip}>
              <p>
                <b>{term.normal}</b>
                { savedId && (
                  <IconButton
                    icon="trash"
                    className={styles.trashButton}
                    onClick={() => deleteWord(id, savedId)} />
                ) || ''}
              </p>

              <p>
                {Object.keys(term.pos).join(', ')}
              </p>
            </div>
          </ToolTip>
        ) || ''}

        {term.whitespace.trailing || ''}
      </span>
    );
  },
  render() {
    const {
      block,
      blockIndex,
      source,
      activeTooltipId,
      showTooltip,
      showTooltipAndSave,
      words,
      deleteWord
    } = this.props;

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
                          const savedId = words[id] && words[id]._id || false;

                          let onClick;

                          if (!savedId) {
                            onClick = () => {
                              const word = {
                                type: Object.keys(term.pos)[0].toLowerCase(),
                                word: term.normal
                              };

                              const example = {
                                text: sentence.map(termToString).join(''),
                                source
                              };

                              showTooltipAndSave(id, blockIndex, word, example);
                            };
                          } else {
                            onClick = () => showTooltip(id, blockIndex);
                          }

                          return this.renderTerm(term, id, isSelected, savedId, onClick, deleteWord);
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

export default InteractiveText;
