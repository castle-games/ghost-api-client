class InMemoryStorage {
  constructor() {
    this._store = {};
  }

  async setAsync(key, value) {
    this._store[key] = value;
  }

  async getAsync(key) {
    return this._store[key];
  }

  async deleteAsync(key) {
    delete this._store[key];
  }
}

class ReactNativeAsyncStorage {
  constructor() {
    let ReactNative = require('react-native');
    this._AsyncStorage = ReactNative.AsyncStorage;
  }

  async setAsync(key, value) {
    await this._AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async getAsync(key) {
    let jsonValue = await this._AsyncStorage(key);
    if (jsonValue) {
      return JSON.parse(jsonValue);
    }
  }

  async deleteAsync(key) {
    await this._AsyncStorage.deleteAsync(key);
  }
}

class BrowserStorage {
  constructor(localStorage_) {
    this._localStorage = localStorage_ || localStorage;
  }

  async setAsync(key, value) {
    this._localStorage.setItem(key, JSON.stringify(value));
  }

  async getAsync(key) {
    let jsonValue = this._localStorage.getItem(key);
    if (jsonValue) {
      return JSON.parse(jsonValue);
    }
  }

  async deleteAsync(key) {
    this._localStorage.removeItem(key);
  }
}

class FileSystemStorage {
  constructor(file) {
    let path = require('path');
    this._file = file || path.join(process.env.HOME, '.ghost-client.json');
  }

  _writeFileAsync(...args) {
    let fs = require('fs');
    return new Promise((resolve, reject) => {
      fs.writeFile(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  _readFileAsync(...args) {
    let fs = require('fs');
    return new Promise((resolve, reject) => {
      fs.readFile(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async _getStoreAsync() {
    try {
      let storeJson = await this._readFileAsync(this._file, 'utf8');
      return JSON.parse(storeJson);
    } catch (e) {
      return {};
    }
  }

  async _writeStoreAsync(store) {
    let storeJson = JSON.stringify(store);
    await this._writeFileAsync(this._file, storeJson, 'utf8');
  }

  async setAsync(key, value) {
    let store = await this._getStoreAsync();
    store[key] = value;
    await this._writeStoreAsync(store);
  }

  async getAsync(key) {
    let store = await this._getStoreAsync;
    return store[key];
  }

  async deleteAsync(key) {
    let store = await this._getStoreAsync();
    delete store[key];
    await this._writeStoreAsync(store);
  }
}

function detectPlatformAndChooseClass() {
  if (typeof global.localStorage === 'object') {
    return BrowserStorage;
  } else {
    try {
      let ReactNative = require('react-native');
      return ReactNativeAsyncStorage;
    } catch (e) {
      if (process && process.versions && process.versions.node) {
        return FileSystemStorage;
      }
    }
  }

  return InMemoryStorage;
}

module.exports = (...args) => {
  let cls = detectPlatformAndChooseClass();
  return new cls(...args);
};

Object.assign(module.exports, {
  InMemoryStorage,
  ReactNativeAsyncStorage,
  BrowserStorage,
  FileSystemStorage,
});
