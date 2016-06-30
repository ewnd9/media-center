import Trakt from 'trakt-utils';

const TRAKT_ID = '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f';
const TRAKT_SECRET = '714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb';
const TRAKT_TOKEN = process.env.TRAKT_TOKEN;

export default new Trakt(TRAKT_ID, TRAKT_SECRET, TRAKT_TOKEN);
