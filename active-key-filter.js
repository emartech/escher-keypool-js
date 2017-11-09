'use strict';

const KeyPoolError = require('./error');
const KeyDb = require('./key-db');

class ActiveKey {

  constructor(keys, keyId) {
    this._keys = keys;
    this._keyId = keyId;
  }

  filter() {
    const keyDb = new KeyDb(this._keys);
    if (this._keyId) keyDb.keepWithStartsWith(this._keyId);
    if (keyDb.isEmpty()) throw this._keyNotFoundError();
    keyDb.keepActives();
    if (keyDb.isEmpty()) throw this._activeKeyNotFoundError();
    if (keyDb.isAmbiguous()) throw this._ambiguousActiveKeyError();
    return keyDb.getFirst();
  }

  _keyNotFoundError() {
    return new KeyPoolError('key_not_found', 'Key not found for: ' + this._keyIdForError());
  }

  _activeKeyNotFoundError() {
    return new KeyPoolError('active_key_not_found', 'Active key not found for: ' + this._keyIdForError());
  }

  _ambiguousActiveKeyError() {
    return new KeyPoolError('ambiguous_active_key', 'Ambiguous active key for: ' + this._keyIdForError());
  }

  _keyIdForError() {
    return (this._keyId) ? this._keyId : 'key id not provided';
  }
}

module.exports = ActiveKey;
