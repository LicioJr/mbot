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
let _authorized = {}; // boolean dictionary of (un)authorized users

function auth(from, authorized) {
    let word = '';
    if (authorized) {
        xmpp.acceptSubscription(from);
    } else {
        xmpp.acceptUnsubscription(from);
        word = 'not ';
    }
    _authorized[from] = authorized;
    log.info(`XMPPAdapter: ${from} ${word}authorized.`);
}

function send(ii) {
    let authorized = _authorized[ii.from];
    if (authorized === false)
        log.info(`XMPPAdapter.ignored: ${ii.from}`);
    else
        return _listener(ii, function(er, oo) {
            if (er) { // close
                xmpp.send(ii.from, 'bye');
                xmpp.disconnect();
            } else
                xmpp.send(ii.from, oo.text);
        });
}

function init(config_adapter, cb) {
    if (config_adapter.onSubscribe)
        _onSubscribe = mbot.load(config_adapter.onSubscribe).onSubscribe;

    xmpp.on('online', function(data) {
        log.info('online JID: ' + data.jid.user);

        let p = config_adapter.setPresence;
        if (p) // ['away', 'dnd', 'xa', 'chat']
            xmpp.setPresence(p.status, p.text);

        /* debug 
        xmpp.unsubscribe('dummy@localhost');
        let roster = xmpp.getRoster();
        xmpp.on('stanza', function(stanza) {
            console.log(stanza);
        });
        */
        cb();
    });

    xmpp.on('chat', function(from, text) {
        // dont reply unauthorized users
        if (_authorized[from] === undefined && _onSubscribe instanceof Function) {
            return _onSubscribe({from}, function(er, oo) {
                if (er)
                    log.error(`XMPPAdapter.onSubscribe: ${er}.`);
                else {
                    auth(from, oo.authorized);
                    send({ from, text });
                }
            });
        }
        send({ from, text });
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
