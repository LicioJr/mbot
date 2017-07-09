'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Core model.
 */
module.exports = {
    User: {
        identity: 'user',
        connection: 'default',
        schema: true,
        attributes: {
            name: 'string',
            birthday: 'date',
            dialogs: {
                collection: 'dialog',
                via: 'user'
            }
        } /* HACK join User
        beforeCreate: function(value, next) {
            that = this.waterline.collections;
            that.user.findOneByName(value.name, function(er, oo) {
                if (er) return next(er);

                if (oo)
                    next(null, oo);
                else
                    next();
            });
        } */
    },
    Dialog: {
        identity: 'dialog',
        connection: 'default',
        schema: true,
        attributes: {
            user: {
                model: 'user'
            },
            request: 'string',
            reply: 'string',
            module: 'string'
        },
        createWithUser: function(value, cb) {
            let that = this.waterline.collections;
            that.user.findOneByName(value.user.name, function(er, oo) {
                if (er) return cb(er);

                if (oo) value.user = oo;

                that.dialog.create(value, function(er, oo) {
                    cb(er);
                });
            });
        }
    }
}



