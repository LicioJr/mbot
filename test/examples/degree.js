'use strict';
let test = require('../../util/test'),
    assert = require('assert');

test.requestTest('examples/degree', [
    {
        request: '#degree c2f "35"',
        expected: '35 degreeCelsius => 95 degreeFahrenheit'
    },
    {
        request: '#degree f2c "95"',
        expected: '95 degreeFahrenheit => 35 degreeCelsius'
    }
]);
