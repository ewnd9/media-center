# media-center

[![Build Status](https://travis-ci.org/ewnd9/media-center.svg?branch=master)](https://travis-ci.org/ewnd9/media-center)
[![Coverage Status](https://coveralls.io/repos/ewnd9/media-center/badge.svg?branch=master&service=github)](https://coveralls.io/github/ewnd9/media-center?branch=master)

Media Center for Raspberry Pi with a seamless [trakt.tv](http://trakt.tv/) scrobbling, `minidlna` and `transmission` integrations

![title-image](/mockup.jpg?raw=true)

### Technologies

Backend:

- `express`
- `socket.io`
- `pouchdb/leveldb` as a storage
- `x11` for hotkeys

Transpiled with `babel` (`es2015` + `stage-0`)

Frontend:

- `react`
- `redux`
- `post-css` (`cssnext` + `autoprefixer`)

## Install

### Clone

```sh
$ git clone https://github.com/ewnd9/media-center.git
$ cd media-center
```

### Provision Raspberry Pi (one time)

Tested with `2016-05-27-raspbian-jessie-lite.img`

```sh
$ ansible-playbook -i <raspberry-ip>, provision/ansible/jessie-update-sshd.yml --ask-pass # default password in rasbpian is "raspberry"
$ ansible-playbook -i <raspberry-ip>, provision/ansible/jessie-docker-arm-playbook.yml --ask-become-pass
$ cp example.deploy.sh deploy.sh
# insert your env variables in `deploy.sh`
```

### Deploy

```
$ ./deploy.sh
```

### Trakt auth token

You could exchange a pin code from https://trakt.tv/pin/6495 for it via [scripts/trakt-token.js](scripts/trakt-token.js). Then you need to copy token to `ecosystem.json` as `TRAKT_TOKEN`

## Credits

Mockup image by [placeit](https://placeit.net/stages/flat-screen-and-ipad-mini-mockup-at-home-a4667?f_devices=tv)

[Icon](http://www.flaticon.com/free-icon/film_148716)
made by [madebyoliver](http://www.flaticon.com/authors/madebyoliver)
from [www.flaticon.com](http://www.flaticon.com)
is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)

## License

MIT © [ewnd9](http://ewnd9.com)
