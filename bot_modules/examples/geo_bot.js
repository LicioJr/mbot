'use strict';
let mbot = require('../../lib'),
    kb = mbot.load('kb/examples/geo_kb');

module.exports = {
    name: 'geo location',
    keywords: ['geo'],
    actions: {
        'ip': ['address', 'location']
    },
    help: 'Get geographic IP address localization, examples:'
        + '\n> my address?'
        + '\n> ip of "github.com"',
    reply
}

function reply(dialog, cb) {
    let ip = '';
    
    if (dialog.entities.length > 0) {
        ip = dialog.entities[0];
    }
    
    return kb.locationFromIp({ ip }, (er, oo) => {
        if (er) return cb(er);

        let text;
        if (oo.message)
            text = oo.message;
        else
            text = `${oo.country_name}, ${oo.region_name}, ${oo.city}`;

        return cb(null, { text });
    });
}
