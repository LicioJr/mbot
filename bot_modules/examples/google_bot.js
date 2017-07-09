'use strict';
// imports
let mbot = require('../../lib'),
    log = mbot.logger('ex/google'), // dummy
    kb = mbot.load('kb/examples/google_kb'),
    format = mbot.load('util/format');

module.exports = {
    keywords: ['google', 'news'],
    actions: {
        tech: 'technology',
        health: ''
    },
    help: 'Display google news from technology and health, examples:'
        + '\n> technology from google'
        + '\n> health news',
    reply
}

function reply(dialog, cb) {
    let topic = dialog.action;

    if (topic != '') {
        log.info(`user '${dialog.from}' search tech news`);
        return kb.latestNews({topic}, (er, list) => {
            if (er) return cb(er);

            cb(null, {
                text: format.list({
                    header: `${dialog.action} news:`,
                    list,
                    footer: `(${list.length} news)`
                })
            });
        });
    }
    cb();
}
