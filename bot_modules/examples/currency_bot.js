'use strict';
let mbot = require('../../lib'),
    kb = mbot.load('kb/examples/currency_kb'),
    format = mbot.load('util/format');

module.exports = {
    keywords: ['currency'],
    actions: {
        'countries': []
    },
    help: 'Show countries that utilize a currency "code", example:'
        + '\n> which countries use "USD" currency?',
    reply
}

function reply(dialog, cb) {
    if (dialog.entities.length > 0 && dialog.action == 'countries') {
        let currencyCode = dialog.entities[0];
        let list = kb.codeToEntities(currencyCode).map(e => e.ENTITY);

        if (list.length == 0)
            return cb(null, {
                text: `Sorry, no entities for ${currencyCode}.`
            });

        return cb(null, {
            text: format.list({
                header: `Entities for ${currencyCode}:`,
                list,
                footer: `(${list.length} entities)`
            })
        });
    }
    cb();
}
