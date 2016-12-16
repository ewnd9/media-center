import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import { schema } from '../../reducers/settings-reducer';
import { reactRouterPropTypes } from '../../schema/react-router';

import { postTraktPin, togglePinInput, POST_TRAKT_PIN_REQUEST } from '../../actions/settings-actions';
import Modal from '../ui/modal/modal';
import IconButton from '../ui/icon-button/icon-button';
import InlineSpinner from '../ui/inline-spinner/inline-spinner';

const mapStateToProps = ({ settings }) => ({ settings });
const mapDispatchToProps = { postTraktPin, togglePinInput };

const Settings = React.createClass({
  propTypes: propTypes({
    ...reactRouterPropTypes,
    children: t.Nil,
    settings: schema,
    togglePinInput: t.Function,
    postTraktPin: t.Function
  }),
  onClose() {
    this.context.router.push('/');
  },
  submitPin(e) {
    const { postTraktPin } = this.props;
    e.preventDefault();

    postTraktPin(this.refs.pin.value);
  },
  render() {
    const { togglePinInput, settings: { pinInputShown, hasPin, currentAction } } = this.props;

    return (
      <Modal
        isOpen={true}
        onRequestClose={this.onClose}>

        <IconButton icon="user" onClick={togglePinInput}>{hasPin ? 'Change Auth Token' : 'Auth Trakt'}</IconButton>

        { pinInputShown && (
          <div className={styles.traktForm}>
            <div>
              Open <a href="https://trakt.tv/pin/6495" target="_blank">Trakt</a> and copy auth pin.
            </div>
            <form onSubmit={this.submitPin} className="row">
              <div className="col-md-6">
                <input type="text" ref="pin" className="form-control" />
              </div>

              <button type="submit" className="btn btn-default">
                {
                  currentAction === POST_TRAKT_PIN_REQUEST &&
                  <InlineSpinner /> ||
                  'Submit'
                }
              </button>
            </form>
          </div>
        )}
      </Modal>
    );
  }
});

Settings.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
