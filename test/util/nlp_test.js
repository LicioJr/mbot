'use strict';
let mbot = require('../../lib'),
    assert = require('assert'),
    nlp = require('../../util/nlp'); // not mbot.load (break bootstrap)

function entitiesExtraction(tests) {
    describe('util/nlp', () => {
        describe('entitiesExtraction', () => {
            tests.forEach(t => {
                it(t.text, () => {
                    let dialog = {
                        text: t.text,
                        entities: [],
                        nonEntities: []
                    };
                    nlp.entitiesExtraction(dialog);
                    assert(dialog.entities.length === t.entities.length);
                    assert(!t.entities.some(e => !dialog.entities.includes(e)));

                    assert(dialog.nonEntities.length === t.nonEntities.length);
                    assert(!t.nonEntities.some(e => !dialog.nonEntities.includes(e)));
                });
            });
        });
    });
}

entitiesExtraction([
    {
        text: '"abc" begin quote',
        entities: ['abc'],
        nonEntities: ['begin', 'quote']
    },
    {
        text: 'middle "abc" quote',
        entities: ['abc'],
        nonEntities: ['middle', 'quote']
    },
    {
        text: 'end quote "abc"',
        entities: ['abc'],
        nonEntities: ['end', 'quote']
    },
    {
        text: '12X3 1 1X begin numeric',
        entities: ['12X3', '1', '1X'],
        nonEntities: ['begin', 'numeric']
    },
    {
        text: 'middle 12X3 1 1X numeric',
        entities: ['12X3', '1', '1X'],
        nonEntities: ['middle', 'numeric']
    },
    {
        text: 'end numeric 1 1X 12X3',
        entities: ['12X3', '1', '1X'],
        nonEntities: ['end', 'numeric']
    },
    {
        text: 'Abc begin uppercase',
        entities: [],
        nonEntities: ['abc', 'begin', 'uppercase']
    },
    {
        text: 'middle Abc uppercase',
        entities: ['Abc'],
        nonEntities: ['middle', 'uppercase']
    },
    {
        text: 'end uppercase Abc',
        entities: ['Abc'],
        nonEntities: ['end', 'uppercase']
    },
    {
        text: 'Multi A Ab uppercase Abc',
        entities: ['Ab', 'Abc'],
        nonEntities: ['multi', 'a', 'uppercase']
    }
]);