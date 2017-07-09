'use strict';
let mbot = require('../../lib'),
    kb = mbot.load('kb/examples/degree_kb');

module.exports = {
    keywords: ['temperature', 'degree'],
    actions: {
        c2f: ['to', 'fahrenheit'],
        f2c: ['to', 'celsius']
    },
    help: 'Temperature conversion, examples:'
        + '\n> 35 to fahrenheit'
        + '\n> 35 c2f'
        + '\n> 95 to celsius'
        + '\n> f2c 95',
    reply
}

function reply(dialog, cb) {
    let act = dialog.action;
    if (dialog.entities.length > 0) {
        let Temperature = dialog.entities[0];
        let FromUnit = '';
        let ToUnit = '';
        if (act == 'c2f') {
            FromUnit = 'degreeCelsius';
            ToUnit = 'degreeFahrenheit';
        }
        if (act == 'f2c') {
            FromUnit = 'degreeFahrenheit';
            ToUnit = 'degreeCelsius';
        }
        if (FromUnit != '') {
            return kb.convert({
                Temperature,
                FromUnit,
                ToUnit
            }, (er, oo) => {
                if (er) return cb(er);
                let text = `${Temperature} ${FromUnit} => ${oo.ConvertTempResult} ${ToUnit}`;
                return cb(null, {text});
            });
        }
    }
    cb();
}
