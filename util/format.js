'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Format helpers.
 */
module.exports = {
    list,
    string,
    clean
}

/**
 * Format a list with prefix, header and trailer.
 * @static
 * @param ii - Input Information
 * @param {string=} ii.prefix - Records prefix (default '> ')
 * @param {string=} ii.header - Header text
 * @param {string[]} ii.list - Text array
 * @param {string=} ii.footer - Footer text
 * @example
 * var format = mbot.load('util/format');
 * format.list({
 *     header: 'result:',
 *     list: ['first', 'record #2'],
 *     footer: '(2 results)'
 * });
 * // result:
 * // > first
 * // > record #2
 * // (2 results)
 */
function list(ii) {
    ii.prefix = ii.prefix || '> ';
    let text = ii.header + '\n' + ii.list.map(e => ii.prefix + e).join('\n');

    if (ii.footer) text += '\n' + ii.footer;

    return text;
}

/**
 * Format string placeholders with sequential arguments.
 * @static
 * @param {string} str - Template string.
 * @param {Object[]} args
 * @example
 * var format = mbot.load('util/format');
 * format.string('foo {0}: {1}', 'bar', 42);
 * // foo bar: 42
 */
function string(str) {
    let args = [].slice.call(arguments, 1);
    return str.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

/**
 * Remove multiple white-spaces, tab, form feed and line feed from a text.
 * @static
 * @param {string} text - Text to clean.
 * @example
 * var format = mbot.load('util/format');
 * format.clean(' a  b\t\t\nc\n d   \n\ne  ');
 * // 'a b c d e'
 */
function clean(text) {
    return text.replace(/\s+/g, ' ').trim();
}
