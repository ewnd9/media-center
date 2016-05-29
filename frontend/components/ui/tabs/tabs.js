import React from 'react';
import styles from '../../theme.css';
import mainStyles from './style.css';

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

    const linkStyle = isLeftPanel ? styles.buttonLeftMargin : styles.button;
    const el = elements.find(el => el.label === active);

    const menuClassName = isLeftPanel ? mainStyles.leftPanelMenu : '';
    const className = isLeftPanel ? '' : mainStyles.rightPanel;

    const cx = [
      styles.container,
      mainStyles.verticallyCenteredContainer,
      mainStyles.navigationBar,
      (isStacked ? mainStyles.stacked : ''),
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

        <div className={`${styles.container} ${styles.mainContainer}`}>
          { el && el.type !== 'router' &&
            React.createElement(el.component, el.getProps && el.getProps(active)) ||
            children }
        </div>
      </div>
    );
  }
});
