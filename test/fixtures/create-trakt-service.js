import TraktService from '../../src/services/trakt-service';
import fs from 'fs';

export default function(trakt, filePath) {
  const service = new TraktService(trakt, filePath);
  service.getPosterStream = () => Promise.resolve(fs.createReadStream(__filename));

  return service;
}
