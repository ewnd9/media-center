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
  - index.html 438 B

- css
  - app.b6683ed4f07f91255ba983e0175c9dd0.css 141.5 kB

- js
  - app.bundle.c6f6f212213c4c83db62.js 550.06 kB
  - vendors.c6f6f212213c4c83db62.js 201.11 kB

## Credits

Mockup image from [placeit](https://placeit.net/stages/flat-screen-and-ipad-mini-mockup-at-home-a4667?f_devices=tv)
Icon from http://www.flaticon.com/free-icon/film_148716

## License

MIT © [ewnd9](http://ewnd9.com)
