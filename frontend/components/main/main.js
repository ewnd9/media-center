import React from 'react';
import styles from './style.css';

import { connect } from 'react-redux';

import t from 'tcomb';
import { propTypes } from 'tcomb-react';

import MediaList from '../media-list/media-list';
import Playback from '../playback/playback';
import RightPanel from '../right-panel/right-panel';
import MediaModal from '../media-modal/media-modal';

import { schema } from '../../reducers/width-reducer';
import { reactRouterPropTypes } from '../../schema/react-router';

const mapStateToProps = ({ width }) => ({ width });

const Main = React.createClass({
  propTypes: propTypes({
    ...reactRouterPropTypes,
    children: t.ReactNode,

    width: schema,
    dispatch: t.Function
  }),
  renderContent() {
    const { width: { isWideScreen }, location: { pathname }, children } = this.props;

    const panel = (
      <RightPanel
        isWideScreen={isWideScreen}>
        {children}
      </RightPanel>
    );

    return isWideScreen ? (
      <div className={styles.container}>
        <MediaList
          location={{ pathname }}
          isLeftPanel={isWideScreen} />
        {panel}
      </div>
    ) : (
      panel
    );
  },
  render() {
    return (
      <div>

        {this.renderContent()}

        <Playback />
        <MediaModal />

      </div>
    );
  }
});

export default connect(mapStateToProps)(Main);
