import React from 'react';
import styles from './style.css';

import ToolTip from 'react-portal-tooltip';
import IconButton from '../../ui/icon-button/icon-button';

function termToString(term) {
  return `${term.whitespace.preceding || ''}${term.text}${term.whitespace.trailing || ''}`;
}

function sentenceToString(sentence) {
  return sentence.map(termToString).join('');
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
  onClickTranslation(id, sentence, term, translation) {
    const {
      source,
      saveWord
    } = this.props;

    const word = {
      type: Object.keys(term.pos)[0].toLowerCase(),
      word: term.normal
    };

    const example = {
      text: sentenceToString(sentence),
      source,
      translation
    };

    saveWord(id, word, example);
  },
  renderSentence(sentence, selectedTerm) {
    return sentence.map((term, index) => {
      if (term === selectedTerm) {
        return (<b>{termToString(term)}</b>);
      } else {
        return (<span>{termToString(term)}</span>);
      }
    })
  },
  renderTerm(id, blockIndex, sentence, term, isSelected, savedId, translations) {
    const {
      showTooltip,
      showTooltipAndFetchTranslations,
      deleteWord
    } = this.props;

    let onClick;

    if (!savedId) {
      onClick = () => showTooltipAndFetchTranslations(id, blockIndex, term.normal);
    } else {
      onClick = () => showTooltip(id, blockIndex);
    }

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

              <div className={styles.smallText}>
                {Object.keys(term.pos).join(', ')}
              </div>

              <div className={styles.smallText}>
                { this.renderSentence(sentence, term) }
              </div>

              <div>
                {
                  translations.map((translation, translationId) => (
                    <div
                      key={translationId}
                      className={styles.translationBlock}
                      onClick={() => this.onClickTranslation(id, sentence, term, translation.translation)}>
                      <div>{translation.translation}</div>
                      <div className={styles.smallText}>{translation.synonyms.join(' | ')}</div>
                    </div>
                  ))
                }
              </div>
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
      words,
      translations
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

                          let t = [];

                          if (translations[id]) {
                            const tr = translations[id];

                            if (tr.type === 'dictionary') {
                              const type = Object.keys(term.pos)[0].toLowerCase();

                              if (tr.result[type]) {
                                t = tr.result[type].translations.map(tr => ({
                                  translation: tr.translation,
                                  synonyms: tr.synonyms
                                }));
                              }
                            }
                          }

                          return this.renderTerm(id, blockIndex, sentence, term, isSelected, savedId, t);
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
