'use strict';
let mbot = require('../../../lib'),
    assert = require('assert'),
    hashtag = require('../../../nlp/hashtag'); // not mbot.load (break bootstrap)

before((done) => {
    hashtag.init({
        config: {},
        modules: {
            'bot1': {
                keywords: ['bot1'],
                actions: {
                    action1: 'substring',
                    action2: ''
                }
            },
            'bot2': {
                keywords: ['bot2'],
                actions: {
                    action1: 'string',
                    action2: ''
                }
            }
        }
    }, done);
});

let xp_sort_intents = (a, b) => (a.bot_id + '|' + a.action) - (b.bot_id + '|' + b.action);

function classify(tests) {
    tests.forEach(t => {
        it(t.title, (done) => {
            let dialog = {
                text: t.text,
                bots: {},
                action: '',
                entities: [],
                nonEntities: []
            }
            hashtag.classify(dialog, (er, intents) => {
                // check bot
                if (!intents) {
                    assert.ok(!t.expected_intents, 'intents empty');
                    return done();
                }
                
                assert.strictEqual(intents.length, t.expected_intents.length, 'intents count');

                if (intents.length > 0) {
                    // sort and compare
                    intents = intents.sort(xp_sort_intents);
                    t.expected_intents = t.expected_intents.sort(xp_sort_intents);
                    for (let i = 0; i < intents.length; i++) {
                        assert.strictEqual(intents[i].bot_id, t.expected_intents[i].bot_id, 'bot_id');
                        assert.strictEqual(intents[i].action, t.expected_intents[i].action, 'action');
                    }
                }

                // check entities
                assert.strictEqual(dialog.entities.length, t.expected_entities.length, 'entities count');
                if (dialog.entities.length > 0) {
                    dialog.entities = dialog.entities.sort();
                    t.expected_entities = t.expected_entities.sort();
                    for (let i = 0; i < dialog.entities.length; i++)
                        assert.strictEqual(odialogo.entities[i], 
                            t.expected_entities[i],
                            'entities element');
                }
                done();
            });
        });
    });
}

describe('nlp/hashtag', () => {
    classify([
        {
            title: 'action substring token',
            text: '#bot1 string action2',
            expected_intents: [
                { bot_id: 'bot1', action: 'action2' }
            ],
            expected_entities: []
        },
        {
            title: 'none',
            text: 'bot1 action2',
            expected_intents: null
        }
    ]);
});
