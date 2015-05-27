'use strict';

var KeyPoolError = require('./error');
var _ = require('lodash');

var ActiveKey = function(keys, keyId) {
  this._keys = keys;
  this._keyId = keyId;
};

ActiveKey.prototype = {

  filter: function() {
    var candidateKeys = this._keys;
    if (this._keyId) {
      candidateKeys = _.filter(candidateKeys, this._candidateKeyFilter(this._keyId));
    }
    if (candidateKeys.length === 0) throw this._keyNotFoundError();
    var candidateKeys = _.filter(candidateKeys, this._activeKeyFilter);
    if (candidateKeys.length === 0) throw this._activeKeyNotFoundError();
    if (candidateKeys.length > 1) throw this._ambiguousActiveKey();
    return _.pick(candidateKeys[0], ['keyId', 'secret']);
  },


  _keyNotFoundError: function() {
    return new KeyPoolError('key_not_found', 'Key not found for: ' + this._keyIdForError());
  },


  _activeKeyNotFoundError: function() {
    return new KeyPoolError('active_key_not_found', 'Active key not found for: ' + this._keyIdForError());
  },


  _ambiguousActiveKey: function() {
    return new KeyPoolError('ambiguous_active_key', 'Ambiguous active key for: ' + this._keyIdForError())
  },


  _keyIdForError: function() {
    return (this._keyId) ? this._keyId : 'key id not provided';
  },


  _candidateKeyFilter: function (keyId) {
    return function (key) {
      return key.keyId.indexOf(keyId) === 0;
    }
  },


  _activeKeyFilter: function (key) {
    return !key.acceptOnly;
  }

};


module.exports = ActiveKey;