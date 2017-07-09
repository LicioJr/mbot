'use strict';
let test = require('../../util/test'),
    assert = require('assert');

test.requestTest('examples/echo', [
    {
        request: '#echo',
        expected: function(text) {
            assert.strictEqual(text, '#echo', text);
        }
    },
    {
        request: '#echo "foo"',
        expected: '#echo "foo"'
    }
]);