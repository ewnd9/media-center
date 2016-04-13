import initDb from './../../src/models/index';
export default () => initDb('/tmp/media-center-db-' + Math.random());
