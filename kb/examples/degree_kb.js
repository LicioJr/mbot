'use strict';
let mbot = require('../../lib'),
    soap = require('soap');

// private
let _client, _mock;

function init(cfg, cb) {
    _mock = cfg.mock;
    let wsdl = cfg.wsdl;
    if (!wsdl.startsWith('http'))
        wsdl = __dirname + wsdl;
    soap.createClient(wsdl, (er, client) => {
        if (!er)
            _client = client;
        //let describe = _client.describe();
        return cb(er);
    })
}

// { Temperature, FromUnit, ToUnit }
function convert(ii, cb) {
    if (!_client)
        return cb('empty client');
    if (_mock) {
        let ConvertTempResult = _mock.ToUnit[ii.ToUnit][ii.Temperature];
        cb(null, { ConvertTempResult });
    } else {
        _client.ConvertTemp(ii, cb);
    }
}

module.exports = {
    config: 'examples/degree',
    init,
    convert
}