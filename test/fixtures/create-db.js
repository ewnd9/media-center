import initDb from '../../src/models/index';
import PouchDB from 'pouchdb-node';
PouchDB.plugin(require('pouchdb-adapter-memory'));

export const generateTmpDir = () => '/tmp/media-center-db-' + Math.random();
export default () => initDb(generateTmpDir(), { adapter: 'memory' });
