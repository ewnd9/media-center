import test from 'ava';

import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { Playback } from '../playback';
import IconButton from '../../ui/icon-button/icon-button';

test('has 2 icons', t => {
  const wrapper = shallow(<Playback playback={{}} />);
  t.truthy(wrapper.find(IconButton).length === 2);
});

test('renders null', t => {
  const wrapper = shallow(<Playback />);
  t.truthy(wrapper.find(IconButton).length === 0);
});

test('callbacks', t => {
  const onStopClick = sinon.spy();
  const wrapper = shallow(<Playback playback={{}} emitClose={onStopClick} />);

  wrapper.find('[icon="stop"]').simulate('click');
  t.truthy(onStopClick.callCount === 1);
});
