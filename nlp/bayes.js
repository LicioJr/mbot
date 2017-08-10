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
    nlp = mbot.load('util/nlp'), // generic helper
    BayesClassifier = nlp.BayesClassifier();

module.exports = {
    init,
    classify
}

// private
let _cfg,
    _bots,
    _stemmer,
    _cache_path,
    _classifier;

function init(ii, cb) {
    _cfg = ii.config;
    _bots = ii.modules;

    // create stemmer/classifier
    _cfg.stemmer = _cfg.stemmer || 'node_modules/natural/lib/natural/stemmers/porter_stemmer.js';
    _stemmer = mbot.load(_cfg.stemmer);
    
    // verify cache
    if (_cfg.cache) {
        _cache_path = mbot.path(_cfg.cache);
        // file exists?
        if (_cache_path) {
            return BayesClassifier.load(_cache_path, null, (er, oo) => {
                if (er) return cb(er);
                _classifier = oo;
                return cb();
            });
        }
    }

    _classifier = new BayesClassifier(_stemmer);

    // create training docs
    for (let id in _bots) {
        let bot = _bots[id];
    
        if (!bot.keywords) {
            log.error(`[nlp/bayes] module "${bot.name}" without keywords.`)
        } else {
            let kw = bot.keywords.join(' ');
            if (!bot.actions) {
                let intent = `${id}|`;
                _classifier.addDocument(kw, intent);
            } else {
                for (let actionName in bot.actions) {
                    let intent = `${id}|${actionName}`;

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

    // import corpora


    // training
    _classifier.train();

    // cache not found?
    if (_cfg.cache && !_cache_path) {
        return _classifier.save(_cfg.cache, (er, oo) => {
            cb(er);
        });
        //let dump = JSON.stringify(_classifier);
        //log.info(`[nlp/bayes] classifier: ${raw}`);
    }
    
    return cb();
}


function classify(dialog, cb) {
    let intents = [];

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
    intents.push({
        bot_id: intent[0],
        action: intent[1]
    });
    
    // Extract other(s) Subject/Action with same rank value
    let i = 0;
    while (++i < result.length) {
        if (result[i].value != result[0].value) break;
        let intent = result[i].label.split('|');
        intents.push({
            bot_id: intent[0],
            action: intent[1]
        });
    }

    return cb(null, intents);
}
