import React from 'react';

import { uploadBook } from '../../api';

export default React.createClass({
  getInitialState() {
    return { book: null };
  },
  onFileChange(e) {
    this.setState({
      book: e.target.files[0]
    });
  },
  onButtonClick(e) {
    e.preventDefault();
    uploadBook(this.state.book, this.state.book.name);
  },
  render() {
    return (
      <div>
        { this.state.book && this.state.book.name }
        <form>
          <input type="file" onChange={this.onFileChange} />
          <button onClick={this.onButtonClick}>Upload</button>
        </form>
      </div>
    );
  }
});
