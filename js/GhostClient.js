let ThinClient = require('thin-client');

let ApiError = require('./ApiError');
let pkg = require('./package');
let Storage = require('./Storage');

let PRODUCTION_API_URL = 'https://ghost-server.app.render.com/api';

class GhostClient extends ThinClient {
  constructor(url, context, opts) {
    url = url || PRODUCTION_API_URL;
    super(url, context, opts);
    this._storage = this._opts.storage || new Storage();
    this._setContextAsync();
  }

  async _setContextAsync() {
    let sessionSecret = await this._storage.getAsync('sessionSecret');
    this._context = this._context || {};
    Object.assign(this._context, {
      sessionSecret,
    });
  }

  clientSimpleMethods() {
    return ['add', 'profile'];
  }

  clientDidReceiveCommands(commands) {}

  clientDidReceiveData(data) {}

  async loginAsync(username, password) {
    try {
      let result = await this.callAsync('login', username, password);
      if (result && result.sessionSecret) {
        await this._storage.setAsync('sessionSecret', result.sessionSecret);
        await this._setContextAsync();
        return result;
      } else {
        throw ApiError('Problem performing login', 'LOGIN_PROBLEM');
      }
    } catch (e) {
      throw e;
    }
  }

  async logoutAsync(sessionSecret) {
    sessionSecret = sessionSecret || (await this._storage.getAsync('sessionSecret'));
    let result = await this.callAsync('logout', sessionSecret);
    await this._storage.deleteAsync('sessionSecret');
    await this._setContextAsync();
    return result;
  }
}

module.exports = GhostClient;

Object.assign(module.exports, {
  Storage,
  PRODUCTION_API_URL,
  ThinClient,
});
