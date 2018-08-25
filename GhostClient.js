let ThinClient = require('thin-client');

let ApiError = require('./ApiError');
let pkg = require('./package');
let storage = require('./storage');

let PRODUCTION_API_URL = 'http://localhost:1380/api';

class GhostClient extends ThinClient {
  constructor(url, context, opts) {
    url = url || PRODUCTION_API_URL;
    super(url, context, opts);
    this._storage = this._opts.storage || storage();
  }

  clientSimpleMethods() {
    return ['add'];
  }

  clientDidReceiveCommands(commands) {}

  clientDidReceiveData(data) {}

  async signInAsync(username, password) {
    try {
      let result = await this.callAsync('signIn', username, password);
      if (result && result.sessionSecret) {
        await this._storage.setAsync('sessionSecret', result.sessionSecret);
      } else {
        throw ApiError('Problem Signing In', 'SIGN_IN_PROBLEM');
      }
    } catch (e) {
      throw e;
    }
  }

  async signOutAsync(sessionSecret) {
    sessionSecret = sessionSecret || (await this._storage.getAsync('sessionSecret'));
    let result = await this.callAsync('signOut', sessionSecret);
    await this._storage.deleteAsync('sessionSecret');
    return result;
  }
  
}

module.exports = GhostClient;

Object.assign(module.exports, {
  storage,
  PRODUCTION_API_URL,
  ThinClient,
});
