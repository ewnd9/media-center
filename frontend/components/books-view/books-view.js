import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import { fetchBook, changeChapter } from '../../actions/book-actions';

const mapStateToProps = ({ book: { isFetching, book, chapterIndex } }) => ({ isFetching, book, chapterIndex });
const mapDispatchToProps = { fetchBook, changeChapter };

const BooksView = React.createClass({
  componentDidMount() {
    const { fetchBook } = this.props;
    const id = this.props.routeParams.id;

    fetchBook(id);
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
  renderChapter(html, key) {
    const children = html.children && html.children.map((child, index) => {
      return this.renderChapter(child, index);
    }) || null;

    // const terms = html.text && nlpFn(html.text).map((sentence, sentenceIndex) => sentence.map((term, index) => this.renderTerm(term, sentenceIndex * 100 + index))) || '';
    const terms = html.text && html.text.map((sentence, sentenceIndex) => sentence.map((term, index) => this.renderTerm(term, sentenceIndex * 100 + index))) || '';

    if (html.isBlockElement) {
      return (
        <div key={key} className={styles.newLine}>
          {children}
          {terms}
        </div>
      );
    } else {
      return (
        <span key={key}>
          {children}
          {terms}
        </span>
      );
    }
  },
  render() {
    const { book, chapterIndex, changeChapter } = this.props;

    if (!book) {
      return (<div>fetching</div>);
    }

    const chapters = book.content.chapters;
    const chapter = chapters[chapterIndex];

    return (
      <div>
        <div>
          {this.renderChapter(chapter, 0)}
        </div>
        <div>
          <span onClick={changeChapter.bind(null, -1)}>Prev</span>
          <span onClick={changeChapter.bind(null, +1)}>Next</span>
        </div>
      </div>
    );
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(BooksView);
