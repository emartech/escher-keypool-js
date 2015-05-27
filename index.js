'use strict';

var _ = require('lodash');
var logger = require('logentries-logformat')('key-pool');
var ActiveKeyFilter = require('./active-key-filter');

var KeyPool = function (keyPoolJson) {
  this._keys = JSON.parse(keyPoolJson);
};

KeyPool.prototype = {

  getActiveKey: function (keyId) {
    var activeKey = new ActiveKeyFilter(this._keys, keyId).filter();
    logger.log('activeKeyQuery', { request: keyId, served: activeKey.keyId });
    return activeKey;
  },


  getKeyDb: function () {
    return function (keyId) {
      var key = _.find(this._keys, { keyId: keyId });
      logger.log('keyDbQuery', { request: keyId, found: !!key });
      return key ? key.secret : key;
    }.bind(this);
  }

};

module.exports = KeyPool;
