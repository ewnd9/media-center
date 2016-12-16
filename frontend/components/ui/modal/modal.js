import React from 'react';
import styles from './style.css';

import Modal from 'react-modal';

const Settings = React.createClass({
  render() {
    const { children, onRequestClose, ...props } = this.props;

    return (
      <Modal
        className={styles.modal}
        overlayClassName={styles.overlay}
        onRequestClose={onRequestClose}
        {...props}>

        <div className={styles.closeButton} onClick={onRequestClose}>&times;</div>
        {children}
      </Modal>
    );
  }
});

export default Settings;
