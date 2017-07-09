'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description XMPP protocol adapter.
 */
module.exports = {
    init,
    onEvent: (listener) => { _listener = listener; }
}

// imports
let mbot = require('../lib'),
    log = mbot.logger(),
    xmpp = require('simple-xmpp');

// private
let _listener;
let _onSubscribe;

function auth(from, authorized) {
    let word = '';
    if (authorized)
        xmpp.acceptSubscription(from);
    else
        word = 'not ';

    log.info(`XMPPAdapter: ${from} ${word}authorized.`);
}

function init(config_adapter, cb) {
    if (config_adapter.onSubscribe)
        _onSubscribe = mbot.load(config_adapter.onSubscribe).onSubscribe;

    xmpp.on('online', function(data) {
        log.info('online JID: ' + data.jid.user);

        let p = config_adapter.setPresence;
        if (p) // ['away', 'dnd', 'xa', 'chat']
            xmpp.setPresence(p.status, p.text);

        // xmpp.unsubscribe('pidgin@localhost'); // test
        // let roster = xmpp.getRoster();
        cb();
    });

    xmpp.on('chat', function(from, text) {
        // ToDo: block unauthorized from.
        
        _listener({ from, text }, function(er, oo) {
            if (er) { // close
                xmpp.send(from, 'bye');
                xmpp.disconnect();
            } else
                xmpp.send(from, oo.text);
        });
    });

    xmpp.on('error', function(er) {
        cb(er);
    });

    xmpp.on('subscribe', function(from) {
        if (_onSubscribe instanceof Function)
            _onSubscribe({from}, function(er, oo) {
                if (er)
                    log.error(`XMPPAdapter.onSubscribe: ${er}.`);
                else
                    auth(from, oo.authorized);
            });
        else
            auth(from, true);
    });

    xmpp.on('unsubscribe', function(from) {
        xmpp.acceptUnsubscription(from);
        log.info(`XMPPAdapter: ${from} unsubscribed.`);
    });

    if (config_adapter.NODE_TLS_REJECT_UNAUTHORIZED != null)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = config_adapter.NODE_TLS_REJECT_UNAUTHORIZED;

    xmpp.connect(config_adapter.settings);
}
