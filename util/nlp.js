'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Natural Language Processing utilities.
 */
module.exports = {
    BayesClassifier,
    entitiesExtraction
}

// imports
let natural = require('natural');

// private
let _reQuotes = /".*?"/g; // /(?:")(.*?)(?:")/g; 
let _reNumbers = /\b\d+/g;
let _reUppercases = /\b(?!^)[A-Z]\w+/g;

/**
 * Create a Bayes Classifier object.
 * @static
 * @param {Object=} stemmer - Optional stemmer.
 */
function BayesClassifier(stemmer) {
    return new natural.BayesClassifier(stemmer);
}

// { text: '' } -> { entities: [], nonEntities: [] }
/**
 * Named Entity extraction.
 * @static
 * @param {Object} dialog
 * @param {string} dialog.text - Input text.
 * @param {string[]} dialog.entities - Entities list (output).
 * @param {string[]} dialog.nonEntities - Non Entities lowercased list (output).
 */
function entitiesExtraction(dialog) {
    /*******************************************************\
    | extract entities
    \*******************************************************/
    dialog.entities = [];

    // extract quotes
    let quotes = dialog.text.match(_reQuotes);
    if (quotes)
        Array.prototype.push.apply(dialog.entities, quotes.map(e => e.replace(/"/g, '').trim()));

    // extract simple numbers
    let numbers = dialog.text.match(_reNumbers);
    if (numbers)
        Array.prototype.push.apply(dialog.entities, numbers);

    // extract uppercase not starting sentence
    let uppercases = dialog.text.match(_reUppercases);
    if (uppercases)
        Array.prototype.push.apply(dialog.entities, uppercases);

    /*******************************************************\
    | expand entities tokens
    \*******************************************************/
    let entitiesTokens = [];
    dialog.entities.forEach(entity => {
        entity.split(' ').forEach(token => {
            entitiesTokens.push(token);
        });
    });

    /*******************************************************\
    | extract nonEntities
    \*******************************************************/
    dialog.nonEntities = [];

    // simple ' ' tokenizer
    dialog.text.split(' ').forEach(token => {
        token = token.replace(/"/g, '');
        if (!entitiesTokens.includes(token))
            dialog.nonEntities.push(token.toLowerCase());
    });
}
