import fs from 'fs';
import MarksService from '../../src/services/marks-service';

const srtText = fs.readFileSync('../fixtures/srt/game-of-thrones-06x10-sample.srt', 'utf-8');

export default () => {
  const MarksServiceMock = function() {
    const service = MarksService.apply(this, Array.prototype.slice.apply(arguments));

    service._fetchSubtitlesFromApi = function() {
      return Promise.resolve(srtText);
    };

    return service;
  };

  return { default: MarksServiceMock };
}
