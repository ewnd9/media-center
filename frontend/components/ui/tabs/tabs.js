import React from 'react';
import styles from '../../theme.css';

export default React.createClass({
  getInitialState() {
    return { active: this.props.initial };
  },
  setActive(value) {
    this.setState({ active: value });
  },
  render() {
    const { elements, rightToLeft, className, children } = this.props;
    const { active } = this.state;

    const linkStyle = !rightToLeft && styles.button || styles.buttonLeftMargin;
    const el = elements.find(el => el.label === active);

    return (
      <div className={className}>
        <div className={styles.container} role="group">
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

        <div className={styles.container}>
          { el && el.type !== 'router' &&
            React.createElement(el.component, el.getProps && el.getProps(active)) ||
            children }
        </div>
      </div>
    );
  }
});
