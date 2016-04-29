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
    const { elements, rightToLeft } = this.props;
    const { active } = this.state;

    const el = elements[active];

    return (
      <div>
        <div className={styles.buttons} role="group">
          {
            Object.keys(elements).map(label => {
              return (
                <button type="button"
                        onClick={this.setActive.bind(this, label)}
                        key={label}
                        className={`${!rightToLeft && styles.button || styles.buttonLeftMargin} ${active === label ? styles.activeButton : ''}`}>
                  { label }
                </button>
              );
            })
          }
        </div>

        { React.createElement(el.component, el.getProps && el.getProps()) }
      </div>
    );
  }
});
