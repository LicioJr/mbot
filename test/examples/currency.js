'use strict';
let test = require('../../util/test'),
    assert = require('assert');

test.requestTest('examples/currency', [
    {
        request: '#currency countries "USD"',
        expected: 'Entities for USD:'
            + '\n> AMERICAN SAMOA'
            + '\n> BONAIRE, SINT EUSTATIUS AND SABA'
            + '\n> BRITISH INDIAN OCEAN TERRITORY (THE)'
            + '\n> ECUADOR'
            + '\n> EL SALVADOR'
            + '\n> GUAM'
            + '\n> HAITI'
            + '\n> MARSHALL ISLANDS (THE)'
            + '\n> MICRONESIA (FEDERATED STATES OF)'
            + '\n> NORTHERN MARIANA ISLANDS (THE)'
            + '\n> PALAU'
            + '\n> PANAMA'
            + '\n> PUERTO RICO'
            + '\n> TIMOR-LESTE'
            + '\n> TURKS AND CAICOS ISLANDS (THE)'
            + '\n> UNITED STATES MINOR OUTLYING ISLANDS (THE)'
            + '\n> UNITED STATES OF AMERICA (THE)'
            + '\n> VIRGIN ISLANDS (BRITISH)'
            + '\n> VIRGIN ISLANDS (U.S.)'
            + '\n(19 entities)'
    },
    {
        request: '#currency countries "XY"',
        expected: 'Sorry, no entities for XY.'
    }
]);