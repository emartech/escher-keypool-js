'use strict';

const { createLogger } = require('@emartech/json-logger');
const KeyPoolError = require('./error');
const logger = createLogger('key-pool');
const ActiveKeyFilter = require('./active-key-filter');

class KeyPool {

  static create(keyPoolJson) {
    return new KeyPool(keyPoolJson);
  }

  constructor(keyPoolJson) {
    try {
      this._keys = JSON.parse(keyPoolJson);
    } catch (ex) {
      throw new KeyPoolError('invalid_keypool_json', 'The provided string cannot be parsed as valid JSON');
    }
  }

  getActiveKey(keyId) {
    const activeKey = new ActiveKeyFilter(this._keys, keyId).filter();
    logger.info('activeKeyQuery', { request: keyId, served: activeKey.keyId });
    return activeKey;
  }

  getKeyDb() {
    return function(keyId) {
      const key = this._keys.find(key => key.keyId === keyId);
      logger.info('keyDbQuery', { request: keyId, found: !!key });
      return key ? key.secret : key;
    }.bind(this);
  }
}

module.exports = KeyPool;
