# media-center

[WIP] Media center web app for raspberry pi with seamless [trakt.tv](http://trakt.tv/) scrobbling

[![title-image](/mockup.jpg?raw=true)]

## Install

```
$ npm install -g media-center
```

## Usage

```
$ cp example.ecosystem.json ecosystem.json
$ pm2 start ecosystem.json
```

## Development

### Setup raspberry

[docs/raspberry-setup.md](docs/raspberry-setup.md)

### Setup deploy to raspberry script

```
$ cp example.deploy.sh deploy.sh # replace user@ip to yours
$ chmod +x deploy.sh
```

### Credits

Mockup image from [placeit](https://placeit.net/stages/flat-screen-and-ipad-mini-mockup-at-home-a4667?f_devices=tv)

## License

MIT © [ewnd9](http://ewnd9.com)
