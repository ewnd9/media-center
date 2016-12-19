import fs from 'fs';

export default SettingsService;
export const TRAKT_TOKEN = 'TRAKT_TOKEN';

function SettingsService(config, db) {
  if (!(this instanceof SettingsService)) {
    return new SettingsService(config, db);
  }

  this.settingsPath = config.dbPath + '/settings.json';

  try {
    this.settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf-8'));
  } catch (e) {
    this.settings = {};
  }

  config.trakt.token = this.getTraktToken();
}

SettingsService.prototype.update = function() {
  fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings));
};

SettingsService.prototype.getTraktToken = function() {
  return this.settings[TRAKT_TOKEN];
};

SettingsService.prototype.setTraktToken = function(token) {
  this.settings[TRAKT_TOKEN] = token;
  this.update();
};
