'use strict';

const chai = require('chai');
const expect = chai.expect;
let config;
const KeyPool = require('./');
const KeyPoolError = require('./error');

describe('KeyPool', function() {


  describe('Static #create', function() {
    let keyPool;

    beforeEach(function() {
      const rawKeyPool = JSON.stringify([
        { keyId: 'suite_ums_v1', secret: 'secret', acceptOnly: 0 }
      ]);

      keyPool = KeyPool.create(rawKeyPool);
    });


    it('should create a new KeyPool object', function() {
      expect(keyPool).to.be.instanceof(KeyPool);
    });


    it('should pass the key pool json to the new KeyPool', function() {
      const key = keyPool.getActiveKey('suite_ums');
      expect(key.keyId).to.eql('suite_ums_v1');
    });

  });


  describe('#init', function() {

    it('throws an error if the keypool JSON cannot be parsed', function() {

      let keyPool;

      try {
        keyPool = new KeyPool('{not a very valid json}');
      } catch (ex) {
        assertError(ex, KeyPoolError, 'invalid_keypool_json', 'The provided string cannot be parsed as valid JSON');
        return;
      }

      throw new chai.AssertionError('Expected KeyPoolError(invalid_keypool_json) but nothing was thrown');
    });

  });

  describe('#getActiveKey', function() {

    it('should return the correct key for the service', function() {
      const rawKeyPool = [
        { keyId: 'sms_ums_v1', secret: 'secret2', acceptOnly: 0 },
        { keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 1 },
        { keyId: 'suite_ums_v2', secret: '<X>', acceptOnly: 0 }
      ];
      config = JSON.stringify(rawKeyPool);
      const keyPool = new KeyPool(config);
      const key = keyPool.getActiveKey('suite_ums');
      expect(key.keyId).to.eql('suite_ums_v2');
      expect(key.secret).to.eql('<X>');
      expect(key.acceptOnly).to.be.undefined;
    });


    it('should throw exception if no key is found for the requested service', function() {
      const keyPool = new KeyPool('[]');

      try {
        keyPool.getActiveKey('suite_ums');
      } catch (ex) {
        assertError(ex, KeyPoolError, 'key_not_found', 'Key not found for: suite_ums');
        return;
      }

      throw new chai.AssertionError('Expected KeyPoolError(key_not_found) but nothing was thrown');
    });


    it('should throw exception if no active key is found for the requested service', function() {
      const rawKeyPool = [{ keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 1 }];
      config = JSON.stringify(rawKeyPool);

      const keyPool = new KeyPool(config);

      try {
        keyPool.getActiveKey('suite_ums');
      } catch (ex) {
        assertError(ex, KeyPoolError, 'active_key_not_found', 'Active key not found for: suite_ums');
        return;
      }

      throw new chai.AssertionError('Expected KeyPoolError(active_key_not_found) but nothing was thrown');
    });


    it('should throw exception if the active key is ambiguous', function() {
      const rawKeyPool = [
        { keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 0 },
        { keyId: 'suite_ums_v2', secret: '<X>', acceptOnly: 0 }
      ];
      config = JSON.stringify(rawKeyPool);

      const keyPool = new KeyPool(config);

      try {
        keyPool.getActiveKey('suite_ums');
      } catch (ex) {
        assertError(ex, KeyPoolError, 'ambiguous_active_key', 'Ambiguous active key for: suite_ums');
        return;
      }

      throw new chai.AssertionError('Expected KeyPoolError(ambiguous_active_key) but nothing was thrown');
    });


    describe('without given keyId', function() {

      it('should return the correct key for the service if only one namespace exists in the given keypool', function() {
        const rawKeyPool = [
          { keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 1 },
          { keyId: 'suite_ums_v2', secret: '<X>', acceptOnly: 0 }
        ];
        config = JSON.stringify(rawKeyPool);

        const keyPool = new KeyPool(config);

        const key = keyPool.getActiveKey();

        expect(key.keyId).to.eql('suite_ums_v2');
        expect(key.secret).to.eql('<X>');
        expect(key.acceptOnly).to.be.undefined;
      });


      it('should throw exception if no key is found for the requested service', function() {
        const keyPool = new KeyPool('[]');

        try {
          keyPool.getActiveKey();
        } catch (ex) {
          assertError(ex, KeyPoolError, 'key_not_found', 'Key not found for: key id not provided');
          return;
        }

        throw new chai.AssertionError('Expected KeyPoolError(key_not_found) but nothing was thrown');
      });


      it('should throw exception if no active key is found for the requested service', function() {
        const rawKeyPool = [{ keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 1 }];
        config = JSON.stringify(rawKeyPool);

        const keyPool = new KeyPool(config);

        try {
          keyPool.getActiveKey();
        } catch (ex) {
          assertError(ex, KeyPoolError, 'active_key_not_found', 'Active key not found for: key id not provided');
          return;
        }

        throw new chai.AssertionError('Expected KeyPoolError(active_key_not_found) but nothing was thrown');
      });


      it('should throw exception if the active key is ambiguous', function() {
        const rawKeyPool = [
          { keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 0 },
          { keyId: 'suite_ums_v2', secret: '<X>', acceptOnly: 0 }
        ];
        config = JSON.stringify(rawKeyPool);

        const keyPool = new KeyPool(config);

        try {
          keyPool.getActiveKey();
        } catch (ex) {
          assertError(ex, KeyPoolError, 'ambiguous_active_key', 'Ambiguous active key for: key id not provided');
          return;
        }

        throw new chai.AssertionError('Expected KeyPoolError(ambiguous_active_key) but nothing was thrown');
      });

    });

  });


  describe('#getKeyDb', function() {

    it('should return a keyDb returning the correct keys', function() {
      const rawKeyPool = [
        { keyId: 'sms_ums_v1', secret: '<Z>', acceptOnly: 0 },
        { keyId: 'suite_ums_v1', secret: '<Y>', acceptOnly: 1 },
        { keyId: 'suite_ums_v2', secret: '<X>', acceptOnly: 0 }
      ];
      config = JSON.stringify(rawKeyPool);

      const keyPool = new KeyPool(config);
      const keyDb = keyPool.getKeyDb();


      expect(keyDb('sms_ums_v1')).to.eql('<Z>');
      expect(keyDb('suite_ums_v1')).to.eql('<Y>');
      expect(keyDb('suite_ums_v2')).to.eql('<X>');
      expect(keyDb('nonExisting')).to.be.undefined;
    });

  });


  const assertError = function(ex, type, code, message) {
    expect(ex).to.be.instanceof(type);
    expect(ex.code).to.eql(code);
    expect(ex.message).to.eql(message);
  };

});

