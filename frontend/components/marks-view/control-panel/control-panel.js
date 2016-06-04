import React from 'react';
import styles from './style.css';

export default React.createClass({
  render() {
    const { isFullWidth, marks, active } = this.props;
    const className = `${styles.container} ${!isFullWidth && styles.rightPanel || ''}`;

    return (
      <div className={className} onClick={this.props.clickNext}>
        { active + 1 } / { marks.length }
      </div>
    );
  }
});
