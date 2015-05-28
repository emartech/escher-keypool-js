'use strict';

var KeyPoolError = require('./error');
var KeyDb = require('./key-db');

var ActiveKey = function(keys, keyId) {
  this._keys = keys;
  this._keyId = keyId;
};

ActiveKey.prototype = {

  filter: function() {
    var keyDb = new KeyDb(this._keys);
    if (this._keyId) keyDb.keepWithStartsWith(this._keyId);
    if (keyDb.isEmpty()) throw this._keyNotFoundError();
    keyDb.keepActives();
    if (keyDb.isEmpty()) throw this._activeKeyNotFoundError();
    if (keyDb.isAmbiguous()) throw this._ambiguousActiveKeyError();
    return keyDb.getFirst();
  },


  _keyNotFoundError: function() {
    return new KeyPoolError('key_not_found', 'Key not found for: ' + this._keyIdForError());
  },


  _activeKeyNotFoundError: function() {
    return new KeyPoolError('active_key_not_found', 'Active key not found for: ' + this._keyIdForError());
  },


  _ambiguousActiveKeyError: function() {
    return new KeyPoolError('ambiguous_active_key', 'Ambiguous active key for: ' + this._keyIdForError());
  },


  _keyIdForError: function() {
    return (this._keyId) ? this._keyId : 'key id not provided';
  }

};


module.exports = ActiveKey;
