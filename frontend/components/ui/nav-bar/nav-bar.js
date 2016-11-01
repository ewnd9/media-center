import React from 'react';
import styles from './style.css';

import { Link } from 'react-router';

export default React.createClass({
  getInitialState() {
    return { isOpened: false };
  },
  setOpened() {
    this.setState({ isOpened: !this.state.isOpened });
  },
  onClick() {
    this.setState({ isOpened: false });
  },
  renderMenu(elements, active, className, setActive, isStacked) {
    return elements
      .map(element => {
        const label = element.label;

        if (element.link) {
          const Link = element.link;
          return <Link key={label} className={className} onClick={this.onClick} />;
        } else {
          return (
            <button type="button"
              onClick={() => setActive(label)}
              key={label}
              className={`${className} ${isStacked ? styles.rightMargin : styles.leftMargin} ${active === label ? styles.activeButton : ''}`}>
              { label }
            </button>
          );
        }
      });
  },
  render() {
    const { head, elements, className, isStacked, active, linkStyle, setActive } = this.props;
    const { isOpened } = this.state;

    return (
      <div className={`${className} ${isStacked ? '' : styles.navBar}`} role="group">
        <div className={styles.head}>
          { head }
          <div className={styles.toggleButton} onClick={this.setOpened}>Menu</div>
        </div>
        <div className={styles.menuSpace}></div>
        <div className={`${styles.menu} ${isOpened ? styles.opened : ''}`}>
          { this.renderMenu(elements, active, linkStyle, setActive, isStacked) }
        </div>
      </div>
    );
  }
});
