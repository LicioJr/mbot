'use strict';
let mbot = require('../../lib'),
    log = mbot.logger('examples/geo'),
    config = mbot.config('examples/geo'),
    http = mbot.load('util/http');

// REST EXAMPLE
// ii: { ip }, cb.oo: { country_name, region_name, city, ... }
function locationFromIp(ii, cb) {
    if (config.mock) {
        if (config.mock[ii.ip])
            return cb(null, config.mock[ii.ip]);
        else
            return cb(null, {
                message: `address [${ii.ip}] not found`
            });
    }

    let url = config.baseUrl + ii.ip;

    http.get({url}, (er, da) => {
        if (er) return cb(er);

        let oo = JSON.parse(da);
        log.info(oo.ip);
        cb(null, oo);
    });
}

module.exports = {
    locationFromIp
}