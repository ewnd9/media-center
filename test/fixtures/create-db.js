import initDb from '../../src/models/index';
import 'pouchdb/extras/memory';

export const generateTmpDir = () => '/tmp/media-center-db-' + Math.random();
export default () => initDb(generateTmpDir(), { adapter: 'memory' });
