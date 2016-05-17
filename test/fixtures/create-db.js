import initDb from '../../src/models/index';

export const generateTmpDir = () => '/tmp/media-center-db-' + Math.random();
export default () => initDb(generateTmpDir());
