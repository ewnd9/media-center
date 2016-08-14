# media-center

[![Build Status](https://travis-ci.org/ewnd9/media-center.svg?branch=master)](https://travis-ci.org/ewnd9/media-center)
[![Coverage Status](https://coveralls.io/repos/ewnd9/media-center/badge.svg?branch=master&service=github)](https://coveralls.io/github/ewnd9/media-center?branch=master)

Media Center for Raspberry Pi with a seamless [trakt.tv](http://trakt.tv/) scrobbling

![title-image](/mockup.jpg?raw=true)

### Technologies

Backend:

- `express`
- `leveldb/pouchdb`
- `socket.io`

Transpiled with `babel` (`es2015` + `stage-0`)

Frontend:

- `react`
- `redux`
- `post-css` (`cssnext` + `autoprefixer`)

Transpiled with `babel` (`es2015` + `stage-0` + `react`) and bundled with `webpack`

## Install

Prerequisites: `raspberry pi` with `raspbian` and `docker`

```sh
$ git clone https://github.com/ewnd9/media-center.git
$ cd media-center
$ cp example.deploy.sh deploy.sh
# insert your env variables in `deploy.sh`
$ ./deploy.sh
```

### Trakt auth token

You could exchange a pin code from https://trakt.tv/pin/6495 for it via [scripts/trakt-token.js](scripts/trakt-token.js). Then you need to copy token to `ecosystem.json` as `TRAKT_TOKEN`

## Development

### Setup raspberry

[docs/raspberry-setup.md](docs/raspberry-setup.md)

## Credits

Mockup image from [placeit](https://placeit.net/stages/flat-screen-and-ipad-mini-mockup-at-home-a4667?f_devices=tv)
Icon from http://www.flaticon.com/free-icon/film_148716

## License

MIT © [ewnd9](http://ewnd9.com)
