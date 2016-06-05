# media-center

[WIP] Media center web app for raspberry pi with seamless [trakt.tv](http://trakt.tv/) scrobbling

![title-image](/mockup.jpg?raw=true)

### Technologies

Backend:

- `express`
- `pouchdb` (only as embedded db for now, without a syncing to browser or anywhere)
- `socket.io`

Transpiled with `babel` (`es2015` + `stage-0`)

Frontend:

- `react`
  - `react-modal`
  - `react-spinkit`
  - `react-select`
- `react-hmr` in development
- `post-css` (`precss` + `autoprefixer`)

Transpiled with `babel` (`es2015` + `stage-0` + `react`) and bundled with `webpack`

## Install

```
$ npm install -g media-center
```

## Usage

```
$ cp example.ecosystem.json ecosystem.json
$ pm2 start ecosystem.json
```

### Trakt auth token

You could exchange a pin code from https://trakt.tv/pin/6495 for it via [scripts/trakt-token.js](scripts/trakt-token.js). Then you need to copy token to `ecosystem.json` as `TRAKT_TOKEN`

## Development

### Setup raspberry

[docs/raspberry-setup.md](docs/raspberry-setup.md)

### Deploy to raspberry script

```
$ cp example.deploy.sh deploy.sh # replace user@ip to yours
$ chmod +x deploy.sh
```

## Filesize report

- html
  - index.html 363 B gziped

- css
  - app.css 25.54 kB gziped

- js
  - vendors.js 61.67 kB gziped
  - app.bundle.js 181.97 kB gziped

## Credits

Mockup image from [placeit](https://placeit.net/stages/flat-screen-and-ipad-mini-mockup-at-home-a4667?f_devices=tv)
Icon from http://www.flaticon.com/free-icon/film_148716

## License

MIT © [ewnd9](http://ewnd9.com)
