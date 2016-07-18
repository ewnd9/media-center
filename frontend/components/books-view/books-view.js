import React from 'react';
import styles from './style.css';

import InteractiveText from '../marks-view/interactive-text/interactive-text';

import { connect } from 'react-redux';
import { fetchBook, changeChapter } from '../../actions/book-actions';

import { Link } from 'react-router';

import {
  showTooltip,
  showTooltipAndFetchTranslations,
  saveWord,
  deleteWord
} from '../../actions/mark-actions';

const mapStateToProps = ({
  book: {
    isFetching,
    book,
    chapter,
    chapterIndex
  },
  mark: {
    activeTooltipId,
    activeBlockIndex,
    words,
    translations
  }
}) => ({ isFetching, book, chapter, chapterIndex, activeTooltipId, activeBlockIndex, words, translations });

const mapDispatchToProps = { fetchBook, changeChapter, showTooltip, showTooltipAndFetchTranslations, saveWord, deleteWord };

const BooksView = React.createClass({
  componentDidMount() {
    const { fetchBook, routeParams: { id, chapter } } = this.props;
    fetchBook(id, chapter);
  },
  componentWillUpdate(nextProps) {
    const { changeChapter, routeParams: { chapter: chapterIndex } } = this.props;
    const { routeParams: { chapter: nextChapterIndex } } = nextProps;

    if (chapterIndex !== nextChapterIndex) {
      changeChapter(nextChapterIndex);
    }
  },
  renderTerm(term, index) {
    return (
      <span key={index}>
        {term.whitespace.preceding || ''}
        <span>{term.text}</span>
        {term.whitespace.trailing || ''}
      </span>
    );
  },
  renderChapter(html, key, source) {
    const {
      words,
      saveWord,
      deleteWord,
      translations,
      activeTooltipId,
      activeBlockIndex,
      showTooltip,
      showTooltipAndFetchTranslations
    }  = this.props;

    const children = html.children && html.children.map((child, index) => {
      return this.renderChapter(child, `${key}-${index}`, source);
    }) || null;

    // const terms = html.text && html.text.map((sentence, sentenceIndex) => sentence.map((term, index) => this.renderTerm(term, sentenceIndex * 100 + index))) || '';

    let terms;

    if (html.text) {
      terms = (
        <InteractiveText
          key={key}
          text={html.text}
          textIndex={key}
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
    } else {
      terms = '';
    }

    const el = (
      <span>
        {children}
        {terms}
      </span>
    );

    if (html.isBlockElement) {
      return (
        <div key={key} className={styles.newLine}>{el}</div>
      );
    } else {
      return (
        <span key={key}>{el}</span>
      );
    }
  },
  render() {
    const { book, chapter, routeParams: { id: bookId, chapter: chapterIndexString } } = this.props;
    const chapterIndex = chapterIndexString && +chapterIndexString || 1;

    if (!book) {
      return (<div>fetching</div>);
    }

    const chapters = book.content.chapters;
    const source = {
      type: 'book',
      author: book.content.author,
      title: book.content.title
    };

    const pagination = (
      <div className={styles.pagination}>
        <Link className={styles.paginationButton} to={`/books/${bookId}/${chapterIndex - 1}`}>Prev</Link>
        {' '}{chapterIndex}{' / '}{chapters.length}{' '}
        <Link className={styles.paginationButton} to={`/books/${bookId}/${chapterIndex + 1}`}>Next</Link>
      </div>
    );

    return (
      <div>
        {pagination}
        <div className={styles.reader}>
          {this.renderChapter(chapter, chapter.id, source)}
        </div>
        {pagination}
      </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(BooksView);
