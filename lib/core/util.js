'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Core utilities.
 */
module.exports = {
    isString,
    isArray,
    isObject,
    replaceEnv
}

function isString(p) {
    return !p ? false : p.constructor === String;
}

function isArray(p) {
    return !p ? false : p.constructor === Array;
}

function isObject(p) {
    return !p ? false : p.constructor === Object;
}

// private
let _regExpEnv = /\${\w*}/g;

// { "p1": "${e1}" } -> { "p1": env[e1] }
function replaceEnv(obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            let value = obj[prop];
            if (isObject(value)) {
                replaceEnv(value); // recursion
            } else {
                if (isString(value)) {
                    obj[prop] = value.replace(_regExpEnv, (match) => {
                        // '${name}'
                        let name = match.substring(2, match.length - 1);
                        return process.env[name];
                    });
                }
            }
        }
    }
}
