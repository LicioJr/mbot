'use strict';
let mbot = require('../../lib'),
    assert = require('assert');

before(() => {
    process.env.MBOT_DB_NAME = 'mbot1';
    process.env.MBOT_DB_USR = 'mbot_usr';
});

describe('util/core', () => {
    it('single', () => {
        let actual = {
            db: '${MBOT_DB_NAME}',
            description: 'xyz'
        }
        let expected = {
            db: 'mbot1',
            description: 'xyz'
        }
        mbot._.replaceEnv(actual);
        assert.deepEqual(actual, expected);
    });
    it('undefined', () => {
        let actual = {
            db: '${MBOT_DB_X}',
            description: 'xyz'
        }
        let expected = {
            db: 'undefined',
            description: 'xyz'
        }
        mbot._.replaceEnv(actual);
        assert.deepEqual(actual, expected);
    });
    it('middle', () => {
        let actual = {
            db: 'db://${MBOT_DB_USR}/db',
            description: 'xyz'
        };
        let expected = {
            db: 'db://mbot_usr/db',
            description: 'xyz'
        }
        mbot._.replaceEnv(actual);
        assert.deepEqual(actual, expected);
    });
    it('multiple', () => {
        let actual = {
            db: 'db://${MBOT_DB_USR}@server/${MBOT_DB_NAME}',
            description: 'xyz',
            n: 5,
            b: false,
            sub: {
               name: '_${MBOT_DB_NAME}_${MBOT_DB_X}_',
            }
        };
        let expected = {
            db: 'db://mbot_usr@server/mbot1',
            description: 'xyz',
            n: 5,
            b: false,
            sub: {
               name: '_mbot1_undefined_' 
            }
        }
        mbot._.replaceEnv(actual);
        assert.deepEqual(actual, expected);
    });
});
