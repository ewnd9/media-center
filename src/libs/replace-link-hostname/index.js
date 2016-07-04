import URL from 'url-parse';

export default (originalUrl, host, port) => {
  const hostUrl = new URL(`http://${host}/`);

  const url = new URL(originalUrl);
  url.hostname = hostUrl.hostname;

  if (port) {
    url.port = hostUrl.port;
  }

  return url.toString();
};
