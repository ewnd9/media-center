/*jslint node: true */
"use strict";

var Util = require('util');
var child_process = require('child_process');
var Events = require('events');
var fs = require('fs');
var assert = require('assert');

var DBus = require('dbus-native');

var invokeSemaphore = require('semaphore')(1);

var DEFAULT_DBUS_ADDRESS_FILENAME = "/tmp/omxplayerdbus";

var DEFAULT_DESTINATION = 'org.mpris.MediaPlayer2.omxplayer';
var DEFAULT_PATH = '/org/mpris/MediaPlayer2';
var DBUS_INTERFACE_PROPERTIES = 'org.freedesktop.DBus.Properties';
var OMXPLAYER_DBUS_INTERFACE_PLAYER = 'org.mpris.MediaPlayer2.Player';

var dbusIdentifier = 0;

function OMXPlayer(configuration) {
	Events.EventEmitter.call(this);

	configuration = configuration || {};

	this._configuration = configuration;

	this.dbusPath = configuration.dbusPath || DEFAULT_PATH;
	this.dbusDestination = configuration.dbusDestination || DEFAULT_DESTINATION;

	configuration.omxPlayerPath = configuration.omxPlayerPath || "omxplayer";

	this._liveProperties = configuration.liveProperties || [ "Volume", "Position", "PlaybackStatus" ];

	var self = this;
	process.on('exit', function(code) {
		var omxProcess = self._omxProcess;
		if (!omxProcess) {
			return;
		}
		self._omxProcess = undefined;

		console.log("Kill processus");

		try {
			omxProcess.kill('SIGKILL');
			omxProcess.disconnect();
		} catch (x) {
			console.error(x);
		}
	});
}

Util.inherits(OMXPlayer, Events.EventEmitter);
module.exports = OMXPlayer;

OMXPlayer.prototype.start = function(moviePath, callback) {
	var configuration = this._configuration;

	var notificationsIntervalId = this._notificationsIntervalId;
	if (notificationsIntervalId) {
		this._notificationsIntervalId = undefined;

		clearInterval(notificationsIntervalId);
	}

	var sessionBus = this._sessionBus;
	if (sessionBus) {
		this.emit("closeSessionBus");
		this._sessionBus = undefined;
		try {
			sessionBus.end();
		} catch (x) {
			console.error(x);
		}
	}

	var omxProcess = this._omxProcess;
	if (omxProcess) {
		this._omxProcess = undefined;

		console.log("Kill OMX process");

		if (omxProcess.connected) {
			this.emit("killOMXPlayer");

			try {
				omxProcess.kill();
				omxProcess.disconnect();
			} catch (x) {
				console.error(x);
			}
		}
	}

	if (!moviePath) {
		if (!callback) {
			return;
		}
		return callback();
	}

	if (configuration.omxPlayerPath) {
		var parameters = [ "-b", "-o", "hdmi", "-p" ];
		if (configuration.omxPlayerParams) {
			parameters = parameters.concat(configuration.omxPlayerParams);
		}

		var dbusName = DEFAULT_DESTINATION + "_" + process.getgid() + "_" + (dbusIdentifier++);
		this.dbusDestination = dbusName;

		parameters.push("--dbus_name", dbusName);

		parameters.push(moviePath);

		console.log("Execute  '" + configuration.omxPlayerPath + "' parameters=", parameters);

		omxProcess = child_process.spawn(configuration.omxPlayerPath, parameters);
		this._omxProcess = omxProcess;

		omxProcess.stderr.on('data', function(data) {
			console.error('omxPlayer: ' + data);
		});

		omxProcess.stdout.on('data', function(data) {
			console.log('omxPlayer: ' + data);
		});

		omxProcess.on('close', function(code) {
			console.log('omxProcess is ended');

			self.stop();
		});
	}

	setTimeout(function() {
		if (!configuration.dbus) {
			configuration.dbus = {};

			var dbusAddressFilename = configuration.dbusAddressFilename || DEFAULT_DBUS_ADDRESS_FILENAME;

			if (!fs.existsSync(dbusAddressFilename)) {

				var dbusAddressFilename2 = dbusAddressFilename + "." + process.env.USER;

				if (!fs.existsSync(dbusAddressFilename2)) {
					throw new Error("Can not get the dbus address  (try content of filename " + dbusAddressFilename2 + ")");
				}

				dbusAddressFilename = dbusAddressFilename2;
			}

			configuration.dbus.busAddress = fs.readFileSync(dbusAddressFilename).toString();

			console.info("Dbus address=", configuration.dbus.busAddress);
		}

		this._sessionBus = DBus.sessionBus(configuration.dbus);
	}.bind(this), 100);

	// console.log("SessionBus=", this._sessionBus);

	var self = this;
	setTimeout(function waitSync() {
		// console.log("Get identity ?");

		self.getIdentity(function(error, id) {
			if (error || !id) {
				console.error("Wait error ", error);
				setTimeout(waitSync, 50);
				return;
			}

			self.properties = {};
			self._notificationsIntervalId = setInterval(function() {
				self._pullProperties(self._liveProperties);
			}, 1000);
			var ps = [].concat(dbusProperties, omxProperties);
			self._pullProperties(ps);

			// console.log("Success ! ", id);
			return callback(null, id);
		});

	}, 200);
}

OMXPlayer.prototype._pullProperties = function(ps) {
	var self = this;
	var properties = self.properties;

	ps.forEach(function(name) {
		self["get" + name].call(self, function(error, value) {
			if (error) {
				console.error("Can not get property '" + name + "'", error);
				return;
			}

			if (properties[name] === value) {
				return;
			}

			properties[name] = value;

			console.log("Property '" + name + "' changed to " + value);

			self.emit("prop:" + name, value);
		});
	});
};

OMXPlayer.prototype._dbusInvoke = function(interf, memberName, signature, body, callback) {

	var params = {
		destination: this.dbusDestination,
		path: this.dbusPath,
		'interface': interf,
		member: memberName
	};
	if (signature) {
		params.signature = signature;
	}
	if (body) {
		params.body = body;
	}

	var self = this;
	invokeSemaphore.take(function() {
		return self._sessionBus.invoke(params, function(error, value) {
			invokeSemaphore.leave();

			if (error) {
				if (!callback) {
					console.error("DBus command error", error);
					return;
				}
				return callback(error);
			}

			if (!callback) {
				return;
			}

			return callback(null, value);
		});
	});
};

var dbusProperties = [ "CanQuit",
	"Fullscreen",
	"CanSetFullscreen",
	"CanRaise",
	"HasTrackList",
	"Identity",
	"SupportedUriSchemes",
	"SupportedMimeTypes",
	"CanGoNext",
	"CanGoPrevious",
	"CanSeek",
	"CanControl",
	"CanPlay",
	"CanPause",
	"PlaybackStatus",
	"Position",
	"Aspect",
	"VideoStreamCount",
	"ResWidth",
	"ResHeight",
	"Duration",
	"MinimumRate",
	"MaximumRate",
	"Volume" ];
dbusProperties.forEach(function(name) {
	OMXPlayer.prototype["get" + name] = function(callback) {
		assert(typeof (callback) === "function", "Invalid callback parameter");

		return this._dbusInvoke(DBUS_INTERFACE_PROPERTIES, name, null, null, callback);
	};
});

var omxProperties = [ "ListSubtitles", "ListAudio", "ListVideo" ];
omxProperties.forEach(function(name) {
	OMXPlayer.prototype["get" + name] = function(callback) {
		assert(typeof (callback) === "function", "Invalid callback parameter");

		return this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, name, null, null, callback);
	};
});

[ "Next",
	"Previous",
	"Pause",
	"PlayPause",
	"Stop",
	"Mute",
	"Unmute",
	"HideVideo",
	"UnHideVideo",
	"ShowSubtitles",
	"HideSubtitles",
	"Quit" ].forEach(function(name) {
	OMXPlayer.prototype[name.substring(0, 1).toLowerCase() + name.substring(1)] = function(callback) {
		return this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, name, null, null, callback);
	};
});

OMXPlayer.prototype.seek = function(offset, callback) {
	return this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, 'Seek', "x", [ offset ], callback);
};

OMXPlayer.prototype.setPosition = function(position, callback) {
	return this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, 'Position', "sx", [ '', position ], callback);
};

OMXPlayer.prototype.setVolume = function(volume, callback) {
	return this._dbusInvoke(DBUS_INTERFACE_PROPERTIES, 'Volume', "d", [ volume ], callback);
};

OMXPlayer.prototype.setVideoPos = function(win, callback) {
	return this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, 'VideoPos', "os", [ '', win ], callback);
};

OMXPlayer.prototype.selectSubtitle = function(index, callback) {
	return this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, 'SelectSubtitle', "i", [ index ], callback);
};

OMXPlayer.prototype.selectAudio = function(index, callback) {
	return this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, 'SelectAudio', "i", [ index ], callback);
};

OMXPlayer.prototype.action = function(action, callback) {
	return this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, 'Action', "i", [ action ], callback);
};

OMXPlayer.prototype.stop = function(callback) {
	var self = this;

	this._dbusInvoke(OMXPLAYER_DBUS_INTERFACE_PLAYER, "Stop", null, null, function(error) {
		self.start(null, callback);

		self.emit("stopped");
	});
};
