import React from 'react';
import styles from '../../theme.css';
import mainStyles from './style.css';

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
      styles.verticalMenuOnSmallScreens,
      styles.verticallyCenteredContainer,
      mainStyles.navigationBar,
      (isStacked ? mainStyles.stacked : ''),
      menuClassName
    ].join(' ');

    return (
      <div className={`${className}`}>
        <div className={cx} role="group">
          { head }
          {
            elements
              .map(element => {
                const label = element.label;

                if (element.link) {
                  const Link = element.link;
                  return <Link key={label} className={linkStyle} />;
                } else {
                  return (
                    <button type="button"
                      onClick={this.setActive.bind(this, label)}
                      key={label}
                      className={`${linkStyle} ${active === label ? styles.activeButton : ''}`}>
                      { label }
                    </button>
                  );
                }
              })
          }
        </div>

        <div className={`${styles.container} ${styles.mainContainer}`}>
          { el && el.type !== 'router' &&
            React.createElement(el.component, el.getProps && el.getProps(active)) ||
            children }
        </div>
      </div>
    );
  }
});
