# Raspberry setup

## Download [raspbian image](https://www.raspberrypi.org/downloads/raspbian/) ~1.4 gb

Latest is `2015-11-21`

## Write to sdcard

```
$ df -h
```

There should be an entries `/dev/mmcblk0p2` and `/dev/mmcblk0p1`

```
$ sudo gparted # unmount, delete and recreate sdcard partion
$ sudo dd bs=4M if=2015-11-21-raspbian-jessie.img of=/dev/mmcblk0
```

## Install node.js

```
$ curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

## Setup npm's global packages without sudo

```
$ npm config set prefix '~/.npm-packages'
$ echo "export PATH=\"\$PATH:$HOME/.npm-packages/bin\"" >> ~/.bashrc
```
