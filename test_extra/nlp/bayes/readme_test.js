'use strict';
// before require('../../util/test')
process.env.MBOT_NODE_ENV = 'tst_bayes';
process.env.MBOT_NODE_ENV_ALT = 'tst';

let test = require('../../../util/test'),
    assert = require('assert');

test.requestTest('readme examples', [
    {
        request: 'which countries use "GBP" currency?',
        expected: `Entities for GBP:
> GUERNSEY
> ISLE OF MAN
> JERSEY
> UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND (THE)
(4 entities)`
    },
    {
        request: '"BRL" country',
        expected: `Entities for BRL:
> BRAZIL
(1 entities)`
    },
    {
        request: '95 to celsius',
        expected: '95 degreeFahrenheit => 35 degreeCelsius'
    },
    {
        request: '35 to fahrenheit',
        expected: `35 degreeCelsius => 95 degreeFahrenheit`
    },
    {
        request: 'some echo here',
        expected: 'some echo here'
    },
    {
        request: 'ip of "github.com"',
        expected: 'United States, California, San Francisco'
    },
    {
        request: 'tech news',
        expected: `tech news:
> Samsung's earnings more than double on record chip profits
> AT&T International Day Pass: Voice Calls, Data, Texts In 100 Countries For $10 A Day
> Google's Calculator App Gets Calculation History Feature With v7.2 Update
(3 news)`
    },
    {
        request: 'show my hobbies',
        expected: `Your hobbies are:
tst1
tst2`
    }
]);
