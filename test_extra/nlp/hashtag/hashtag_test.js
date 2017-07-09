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
            hashtag.classify(dialog, (er, oo) => {
                // check bot
                if (!oo) {
                    assert.ok(!t.expected_bots, 'bots empty');
                    done();
                }
                let bot_names = Object.keys(oo.bots);
                assert.strictEqual(bot_names.length, t.expected_bots.length, 'bots count');
                if (bot_names.length > 0) {
                    bot_names = bot_names.sort();
                    t.expected_bots = t.expected_bots.sort();
                    for (let i = 0; i < bot_names.length; i++)
                        assert.strictEqual(bot_names[i], 
                            t.expected_bots[i],
                            'bots element');
                }

                // check action
                assert.strictEqual(oo.action, t.expected_action, 'action');

                // check entities
                assert.strictEqual(oo.entities.length, t.expected_entities.length, 'entities count');
                if (oo.entities.length > 0) {
                    oo.entities = oo.entities.sort();
                    t.expected_entities = t.expected_entities.sort();
                    for (let i = 0; i < oo.entities.length; i++)
                        assert.strictEqual(oo.entities[i], 
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
            expected_bots: ['bot1'],
            expected_action: 'action2',
            expected_entities: []
        },
        {
            title: 'none',
            text: 'bot1 action2',
            expected_bots: null
        }
    ]);
});
