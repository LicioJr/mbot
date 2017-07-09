'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Bayes Classifier NLP module.
 */

// imports
let mbot = require('../lib'),
    log = mbot.logger(),
    nlp = mbot.load('util/nlp'); // generic helper

module.exports = {
    init,
    classify
}

// private
let _cfg,
    _bots,
    _stemmer,
    _classifier;

function init(ii, cb) {
    _cfg = ii.config;
    _bots = ii.modules;

    // create stemmer/classifier
    _cfg.stemmer = _cfg.stemmer || 'node_modules/natural/lib/natural/stemmers/porter_stemmer.js';
    _stemmer = mbot.load(_cfg.stemmer);
    _classifier = new nlp.BayesClassifier(_stemmer);
    
    // create training docs
    for (let name in _bots) {
        let bot = _bots[name];
    
        if (!bot.keywords) {
            log.error(`[nlp/bayes] module "${bot.name}" without keywords.`)
        } else {
            let kw = bot.keywords.join(' ');
            if (!bot.actions) {
                let intent = `${name}|`;
                _classifier.addDocument(kw, intent);
            } else {
                for (let actionName in bot.actions) {
                    let intent = `${name}|${actionName}`;

                    let actionData = bot.actions[actionName];
                    if (actionData instanceof Array) {
                        actionData = actionData.map(a => _stemmer.stem(a));
                        bot.keywords.forEach(k => {
                            actionData.push(_stemmer.stem(k));
                        });
                        actionData.push(_stemmer.stem(actionName));
                        _classifier.addDocument(actionData, intent);
                    } else {
                        let text = `${kw} ${actionName} ${actionData}`;
                        _classifier.addDocument(text, intent);
                    }
                }
            }
        }
    };

    _classifier.train();

    let raw = JSON.stringify(_classifier);
    //log.info(`[nlp/bayes] classifier: ${raw}`);
    return cb();
}


function classify(dialog, cb) {
    /*******************************************************\
    | Classify
    \*******************************************************/
    // separate entities from nonEntities
    nlp.entitiesExtraction(dialog);
    let text = dialog.nonEntities.join(' ');

    // [{label, value}]
    let result = _classifier.getClassifications(text);

    // sort
    result = result.sort((a,b) => b.value - a.value);

    // Extract 1st Subject/Action
    let intent = result[0].label.split('|');
    dialog.bots[intent[0]] = _bots[intent[0]];
    dialog.action = intent[1];
    
    // Extract other(s) Subject/Action with same rank value
    let i = 0;
    while (++i < result.length) {
        if (result[i].value != result[0].value) break;
        let intent = result[i].label.split('|');
        dialog.bots[intent[0]] = _bots[intent[0]];
    }

    /*******************************************************\
    | Extract Tokens (ignore action/entities)
    \*******************************************************
    dialog.tokens = [];
    dialog.text.split(' ').forEach(token => {
        if (token != dialog.action && !dialog.entities.includes(token))
            dialog.tokens.push(token.toLowerCase());
    }); */

    return cb(null, dialog);
}
