import React from 'react';
import styles from './style.css';

import NavBar from '../nav-bar/nav-bar';

export default React.createClass({
  getInitialState() {
    return { active: this.props.initial };
  },
  setActive(value) {
    this.setState({ active: value });
  },
  render() {
    const { elements, children, head, isLeftPanel, isStacked } = this.props;
    const { active } = this.state;

    const linkStyle = `${styles.button} ${styles.buttonLink} ${isLeftPanel ? styles.buttonLeftMargin : ''}`;
    const el = elements.find(el => el.label === active);

    const menuClassName = isLeftPanel ? styles.leftPanelMenu : '';
    const className = isLeftPanel ? '' : styles.rightPanel;

    const cx = [
      styles.container,
      styles.verticallyCenteredContainer,
      styles.navigationBar,
      (isStacked ? styles.stacked : ''),
      menuClassName
    ].join(' ');

    return (
      <div className={`${className}`}>
        <NavBar
          head={head}
          className={cx}
          isStacked={isStacked}
          active={active}
          setActive={this.setActive}
          linkStyle={linkStyle}
          elements={elements} />

        <div className={`${styles.container} ${styles.mainContainer} ${isStacked ? styles.stacked : ''}`}>
          { el && el.type !== 'router' &&
            React.createElement(el.component, el.getProps && el.getProps(active)) ||
            children }
        </div>
      </div>
    );
  }
});
