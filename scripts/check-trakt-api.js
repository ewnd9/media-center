const Trakt = require('trakt-utils');

const traktId = '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f';
const traktSecret = '714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb';
const trakt = new Trakt(traktId, traktSecret, '<>');

trakt
  .getReport()
  .then(data => console.log(data))
  .catch(err => console.log(err));
