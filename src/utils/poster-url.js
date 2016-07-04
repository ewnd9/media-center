export default function getPosterUrl(type, imdb, s, host) {
  if (type && imdb) {
    return `http://${host || 'localhost'}/api/v1/posters/${[type, imdb, s].filter(_ => !!_).join('/')}`;
  } else {
    return `http://${host || 'localhost'}/api/v1/posters/placeholder.jpg`;
  }
}
