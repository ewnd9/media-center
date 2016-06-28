let i = 0;

export const generateMedia = () => ({
  imdb: `tt${i++}`,
  type: 'show',
  title: 'Test Show'
});
