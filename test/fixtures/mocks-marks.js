import { generateMedia } from './mocks-media';

export const generateMark = () => ({
  media: generateMedia(),
  position: 0,
  duration: 0,
  progress: 0,
  file: '/'
});
