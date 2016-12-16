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
$ yarn install
```

### Provision

Tested with `2016-05-27-raspbian-jessie-lite.img`

```sh
$ cp provision/ansible/example.variables.yml provision/ansible/variables.yml

$ ansible-playbook -i <raspberry-ip>, provision/ansible/jessie-update-sshd.yml --ask-pass # default password in rasbpian is "raspberry"
$ ansible-playbook -i <raspberry-ip>, provision/ansible/jessie-docker-arm.yml --ask-become-pass
$ ansible-playbook -i <raspberry-ip>, provision/ansible/jessie-deploy-arm.yml
$ ansible-playbook -i <raspberry-ip>, provision/ansible/jessie-backup.yml
```

### Deploy

```sh
$ ansible-playbook -i <raspberry-ip>, provision/ansible/jessie-deploy-arm.yml
```

## Development

```sh
$ cp start-dev.example.sh start-dev.sh
$ ./start-dev.sh run yarn # install deps
$ ./start-dev.sh --build # start server
$ open "http://localhost:3000/"
```

## Credits

Mockup image by [placeit](https://placeit.net/stages/flat-screen-and-ipad-mini-mockup-at-home-a4667?f_devices=tv)

[Icon](http://www.flaticon.com/free-icon/film_148716)
made by [madebyoliver](http://www.flaticon.com/authors/madebyoliver)
from [www.flaticon.com](http://www.flaticon.com)
is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)

## License

MIT © [ewnd9](http://ewnd9.com)
