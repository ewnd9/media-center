import createReporter from 'ohcrash';

const reporter = (process.env.NODE_ENV === 'production' && process.env.ERROR_BOARD_URL) ?
  createReporter('media-center', {
    uncaughtExceptions: false,
    exit: false,
    unhandledRejections: false,
    windowOnError: false,
    endpoint: process.env.ERROR_BOARD_URL
  }) : null;

export default function(err, metaData = {}) {
  if (reporter) {
    return reporter.report(err, metaData).catch(err => console.error(err)); // prevent recursion
  }
}
