'use strict';
let mbot = require('../../lib'),
    format = require('../../util/format'), // not mbot.load (break bootstrap)
    assert = require('assert');

describe('util/format', () => {
    it('clean', () => {
        let act = format.clean(' a  b\t\t\nc\n d   \n\ne  ');
        let exp = 'a b c d e';
        assert.equal(act, exp);
    });
    it('string', () => {
        let act = format.string('foo {0}: {1}', 'bar', 42);
        let exp = 'foo bar: 42';
        assert.equal(act, exp);
    });
    it('list', () => {
        let act = format.list({
            header: 'result:',
            list: ['first', 'record #2'],
            footer: '(2 results)'
        });
        let exp = 'result:'
            + '\n> first'
            + '\n> record #2'
            + '\n(2 results)';
        assert.equal(act, exp);
    });
});
