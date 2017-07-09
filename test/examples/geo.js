'use strict';
let test = require('../../util/test'),
    assert = require('assert');

test.requestTest('examples/geo', [
    {
        request: '#geo "github.com"',
        expected: 'United States, California, San Francisco'
    },
    {
        request: '#geo "notfound.com"',
        expected: 'address [notfound.com] not found'
    }
]);
