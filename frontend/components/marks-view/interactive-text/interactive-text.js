import React from 'react';
import styles from './style.css';

import InteractivePopup from '../interactive-popup/interactive-popup';

const InteractiveText = React.createClass({
  shouldComponentUpdate(nextProps) {
    const { activeBlockIndex: currIndex, textIndex: index } = this.props;
    const { activeBlockIndex: nextIndex } = nextProps;

    return (
      nextIndex === index ||
      (currIndex === index && nextIndex !== index)
    );
  },
  renderTerm(id, blockIndex, sentence, term, isSelected, savedId, translations) {
    const {
      source,
      showTooltip,
      showTooltipAndFetchTranslations,
      saveWord,
      deleteWord
    } = this.props;

    let onClick;

    if (!savedId) {
      onClick = () => showTooltipAndFetchTranslations(id, blockIndex, Object.keys(term.pos)[0].toLowerCase(), term.normal);
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
          <InteractivePopup
            id={id}
            savedId={savedId}
            isSelected={isSelected}
            sentence={sentence}
            term={term}
            source={source}
            translations={translations}
            saveWord={saveWord}
            deleteWord={deleteWord} />
        ) || ''}

        {term.whitespace.trailing || ''}
      </span>
    );
  },
  render() {
    const {
      text,
      textIndex,
      activeTooltipId,
      words,
      translations
    } = this.props;

    return (
      <div>
        {
          text.map((sentence, sentenceIndex) => (
            <span key={sentenceIndex}>
              { sentence.map((term, termIndex) => {
                  const id = `term-${[textIndex, sentenceIndex, termIndex].join('-')}`;
                  const isSelected = activeTooltipId && activeTooltipId === id;
                  const savedId = words[id] && words[id]._id || false;
                  const t = translations[id] || null;

                  return this.renderTerm(id, textIndex, sentence, term, isSelected, savedId, t);
                })
              }
            </span>
          ))
        }
      </div>
    );
  }
});

export default InteractiveText;
