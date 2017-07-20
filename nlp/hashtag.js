'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Deterministic NLP module for simple use or test automation.
 * Require some "#subject", optional action (simple token) and/or entities.
 */

// imports
let mbot = require('../lib'),
    nlp = mbot.load('util/nlp'); // generic helper

module.exports = {
    init,
    classify
}

// private
let _cfg, 
    _bots,
    _reHashtag = /#[a-zA-Z0-9\-]+/gi;

function init(ii, cb) {
    _cfg = ii.config;
    _bots = ii.modules;
    cb();
}

// #subject "entityX" [token1]...
// tokens: all except subject or entities
// action: first token, if exists
function extract(dialog) {
    /*******************************************************\
    | Extract Subject
    \*******************************************************/
    let lower = dialog.text.toLowerCase();
    let tags = lower.match(_reHashtag);
    if (tags == null || tags.length != 1)
        return {};

    let subject = tags[0].replace('#', '');

    /*******************************************************\
    | Extract Entities
    \*******************************************************/
    nlp.entitiesExtraction(dialog);

    /*******************************************************\
    | Extract Tokens (ignore Subject/Entities)
    \*******************************************************/
    let tokens = [];
    dialog.nonEntities.forEach(token => {
        if (!tags.includes(token))
            tokens.push(token.toLowerCase());
    });

    return { subject, tokens };
}

function hasSomeTokenInString(tokens, str) {
    let strTokens = str.split(' ');
    return tokens.some(t => strTokens.includes(t));
}

function firstActionWithSomeToken(actions, tokens) {
    for (let actionName in actions) {
        if (tokens.includes(actionName))
            return actionName;

        // action dictionary may contain String or Array of Strings
        // in both case, must compare with each token
        let actionData = actions[actionName];
        if (mbot._.isString(actionData)) {
            if (hasSomeTokenInString(tokens, actionData))
                return actionName;
        } else if (mbot._.isArray(actionData)) {
            if (actionData.some(data => hasSomeTokenInString(tokens, data)))
                return actionName;
        }
    }
    return '';
}

function classify(dialog, cb) {
    let oo = extract(dialog);
    if (!oo.subject) return cb();

    // allow multiple resolution
    let intents = [];
    let match = 0;
    for (let id in _bots) {
        let bot = _bots[id];
        let iKey = 0; // loop keywords
        while (iKey < bot.keywords.length) {
            let sKey = bot.keywords[iKey];

            // bot/subject check
            if (oo.subject === sKey) {
                match++;

                // add bot reference
                let intent = {
                    bot_id: id
                }

                // action check
                if (oo.tokens.length > 0) {
                    if (!bot.actions)
                        intent.action = oo.tokens[0];
                    else
                        intent.action = firstActionWithSomeToken(bot.actions, oo.tokens);
                }
                intents.push(intent);
            }
            iKey++;
        }
    }

    return cb(null, intents);
}
