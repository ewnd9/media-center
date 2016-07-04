import React from 'react';
import styles from './style.css';

import IconButton from '../../ui/icon-button/icon-button';
import ToolTip from 'react-portal-tooltip';

function termToString(term) {
  return `${term.whitespace.preceding || ''}${term.text}${term.whitespace.trailing || ''}`;
}

function sentenceToString(sentence) {
  return sentence.map(termToString).join('');
}

const InteractivePopup = React.createClass({
  onClickTranslation(translation) {
    const {
      id,
      sentence,
      term,
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
        return (<b key={index}>{termToString(term)}</b>);
      } else {
        return (<span key={index}>{termToString(term)}</span>);
      }
    });
  },
  render() {
    const {
      id,
      savedId,
      isSelected,
      sentence,
      term,
      translations,
      deleteWord
    } = this.props;

    return (
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
                  onClick={() => this.onClickTranslation(translation.translation)}>
                  <div>{translation.translation}</div>
                  <div className={styles.smallText}>{translation.synonyms.join(' | ')}</div>
                </div>
              ))
            }
          </div>
        </div>
      </ToolTip>
    );
  }
});

export default InteractivePopup;
