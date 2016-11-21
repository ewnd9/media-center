import Alertify from 'alertify.js';

const alertify = new Alertify();

alertify.logPosition('top right');
alertify.delay(0);
alertify.closeLogOnClick(true);

export default {
  info: message => alertify.log(message),
  error: message => alertify.error(message instanceof Error ? message.stack && message.stack.split('\n').join('<br />') || message : alertify(message))
};
