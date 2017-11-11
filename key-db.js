'use strict';

class KeyDb {
  constructor(keys) {
    this._keys = keys;
  }

  keepWithStartsWith(keyId) {
    this._keys = this._keys.filter(function candidateKeyFilter(key) {
      return key.keyId.indexOf(keyId) === 0;
    });
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
}

module.exports = KeyDb;
