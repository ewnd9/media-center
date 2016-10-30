import TraktService from '../../src/services/trakt-service';
import fs from 'fs';

export default function(trakt, filePath, tmdbApi, db) {
  const service = new TraktService(trakt, filePath, tmdbApi, db);
  service.getPosterStream = () => Promise.resolve(fs.createReadStream(__filename));

  return service;
}
