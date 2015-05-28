'use strict';

var _ = require('lodash');

var KeyDb = function(keys) {
  this._keys = keys;
};

KeyDb.prototype = {

  keepWithStartsWith: function(keyId) {
    this._keys = _.filter(this._keys, function candidateKeyFilter(key) {
      return key.keyId.indexOf(keyId) === 0;
    });
  },


  keepActives: function() {
    this._keys = _.filter(this._keys, function activeKeyFilter(key) {
      return !key.acceptOnly;
    });
  },


  isEmpty: function() {
    return this._keys.length === 0;
  },


  isAmbiguous: function() {
    return this._keys.length > 1;
  },


  getFirst: function() {
    return _.pick(this._keys[0], ['keyId', 'secret']);
  }

};


module.exports = KeyDb;
