import URL from 'url-parse';

export default (originalUrl, host) => {
  const hostUrl = new URL(`http://${host}/`);

  const url = new URL(originalUrl);
  url.hostname = hostUrl.hostname;

  return url.toString();
};
