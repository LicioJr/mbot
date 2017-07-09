'use strict';
let test = require('../../util/test'),
    assert = require('assert');

test.requestTest('examples/google', [
    {
        request: '#google tech',
        expected: 'tech news:'
            + "\n> Samsung's earnings more than double on record chip profits"
            + "\n> AT&T International Day Pass: Voice Calls, Data, Texts In 100 Countries For $10 A Day"
            + "\n> Google's Calculator App Gets Calculation History Feature With v7.2 Update"
            + "\n(3 news)"
    }
]);
