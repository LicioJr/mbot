'use strict';
// imports
let mbot = require('../../lib'),
    db = mbot.load('util/db');

module.exports = {
    config: 'examples/hobby',
    init,
    dispose,
    addHobby,
    removeHobby,
    listHobbies
}

// private
let _db;

let model = {
    "User": {
        "identity": "user",
        "connection": "hobby",
        "schema": true,
        "attributes": {
            "name": "string",
            "hobbies": {
                "type": "json",
                "defaultsTo": []
            }
        }
    }
}

function init(cfg, cb) {
    _db = new db(cfg.db);
    _db.open(model, (er) => {
        if (er) return cb(er);
        cb();
    });
}

function dispose(cb) {
    _db.dispose(cb);
}

/**
 * Add user hobby
 * @static
 * @param {Object} ii - Input Information
 * @param {string} ii.user - user name
 * @param {string} ii.hobby - hobby text
 * @param {function} cb - Callback
 */
function addHobby(ii, cb) {
    // check user
    _db.model.user.findOneByName(ii.user, (er, oo) => {
        if (er) return cb(er);
        if (oo) {
            // existing user
            if (oo.hobbies.includes(ii.hobby))
                return cb();
            else {
                // add hobby
                oo.hobbies.push(ii.hobby);
                return oo.save(cb);
            }
        }

        // new user
        return _db.model.user.create({
            name: ii.user,
            hobbies: [ ii.hobby ]
        }, cb);
    });
}

/**
 * Remove user hobby
 * @static
 * @param {Object} ii - Input Information
 * @param {string} ii.user - user name
 * @param {string} ii.hobby - hobby text
 * @param {function} cb - Callback
 */
function removeHobby(ii, cb) {
    // check user
    _db.model.user.findOneByName(ii.user, (er, oo) => {
        if (er) return cb(er);
        if (oo) {
            // existing user
            let i = oo.hobbies.indexOf(ii.hobby);
            if (i < 0)
                return cb();
            else {
                // remove hobby
                oo.hobbies.splice(i, 1);
                return oo.save(cb);
            }
        }

        // unknown user
        return cb();
    });
}

/**
 * List user hobbies
 * @static
 * @param {Object} ii - Input Information
 * @param {string} ii.user - user name
 * @param {function} cb - Callback
 * @param {Error?} cb.er - Error
 * @param {string[]} cb.list - Hobbies array
 */
function listHobbies(ii, cb) {
    _db.model.user.findOneByName(ii.user, (er, oo) => {
        if (er) return cb(er);
        if (oo) {
            return cb(null, oo.hobbies);
        } else {
            return cb(null, []);
        }
    });
}
