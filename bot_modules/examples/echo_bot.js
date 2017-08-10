'use strict';
let log = require('../../lib').logger(); // use main log

function reply(dialog, cb) {
    let text = dialog.text;
    log.info(text);
    dialog.state.history = dialog.state.history || [];
    dialog.state.history.push(text);
    cb(null, {text})
}

module.exports = {
    name: 'echo test',
    keywords: ['echo'],
    reply
}