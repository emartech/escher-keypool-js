'use strict';

class KeyDb {
  constructor(keys) {
    this._keys = keys;
  }

  keepWithStartsWith(keyId) {
    this._keys = this._keys.filter(function candidateKeyFilter(key) {
      return this._getKeyWithoutVersion(key.keyId) === keyId;
    }, this);
  }

  keepActives() {
    this._keys = this._keys.filter(function activeKeyFilter(key) {
      return !key.acceptOnly;
    });
  }

  isEmpty() {
    return this._keys.length === 0;
  }

  isAmbiguous() {
    return this._keys.length > 1;
  }

  getFirst() {
    const firstKey = this._keys[0];
    return { keyId: firstKey.keyId, secret: firstKey.secret };
  }

  _getKeyWithoutVersion(keyId) {
    return keyId.split('_').slice(0, -1).join('_');
  }
}

module.exports = KeyDb;
