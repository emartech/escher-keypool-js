'use strict';

var _ = require('lodash');
var KeyPoolError = require('./error');
var logger = require('logentries-logformat')('key-pool');
var ActiveKeyFilter = require('./active-key-filter');

var KeyPool = function(keyPoolJson) {
  try {
    this._keys = JSON.parse(keyPoolJson);
  } catch (ex) {
    throw new KeyPoolError('invalid_keypool_json', 'The provided string cannot be parsed as valid JSON');
  }
};

KeyPool.prototype = {

  getActiveKey: function(keyId) {
    var activeKey = new ActiveKeyFilter(this._keys, keyId).filter();
    logger.log('activeKeyQuery', { request: keyId, served: activeKey.keyId });
    return activeKey;
  },


  getKeyDb: function() {
    return function(keyId) {
      var key = _.find(this._keys, { keyId: keyId });
      logger.log('keyDbQuery', { request: keyId, found: !!key });
      return key ? key.secret : key;
    }.bind(this);
  }

};

KeyPool.create = function(keyPoolJson) {
  return new KeyPool(keyPoolJson);
};

module.exports = KeyPool;
