import React from 'react';
import styles from './style.css';

import InteractiveText from '../interactive-text/interactive-text';

export default React.createClass({
  render() {
    const {
      block,
      blockIndex,
    } = this.props;

    return (
      <div key={block.startTimeMs} className={styles.line}>
        <div className={styles.time}>{block.startTime} -> {block.endTime}</div>
        {
          block.text
            .map((line, lineIndex) => (
              <InteractiveText
                {...this.props}
                text={line}
                textIndex={`${blockIndex}-${lineIndex}`} />
            ))
        }
      </div>
    );
  }
});
