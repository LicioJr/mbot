'use strict';
/**
 * MBOT - Modular Bot Framework
 * @module
 * @description Bot example.
 */
module.exports = {
    keywords: ['template'],
    reply
}

/**
 * Required function.
 * @param {Object} dialog - Dialog information
 * @param {function} cb - Callback
 */
function reply(dialog, cb) {
    let text = 'hello ' + dialog.from;
    return cb(null, {text})
}
