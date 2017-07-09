'use strict';
let test = require('../../util/test'),
    assert = require('assert');

test.requestTest('examples/hobby', [
    {
        request: '#hobby list',
        expected: 'Your hobbies are:'
            + '\ntst1'
            + '\ntst2'
    }
]);
