'use strict';

class KeyPoolError extends Error {
  constructor(code, message) {
    super();

    this.name = 'KeyPoolError';
    this.code = code;
    this.message = message;
  }
}

module.exports = KeyPoolError;
