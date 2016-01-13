import initDb from './../../src/db';
export default () => initDb('/tmp/media-center-db-' + Math.random());
