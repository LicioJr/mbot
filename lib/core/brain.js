'use strict';
/**
 * MBOT - Modular Bot Framework
 * Copyright (c) 2017 Licio Medeiros Jr. All rights reserved.
 * 
 * License: GNU Lesser General Public License (LGPL), version 3 or later.
 * See the LICENSE file in the root directory or {@link https://www.gnu.org/licenses/lgpl.html}.
 * 
 * @module
 * @description Main controller. Tasks: load/init all modules (db, bot, kb, nlp, adapter).
 */
module.exports = {
    config: 'core/brain',
    init
};

// imports
let mbot = require('../'),
    log = mbot.logger(),
    db = mbot.load('util/db'),
    format = mbot.load('util/format');

// private
let _db, _nlp, _adapter, _cfg, _help;
let _modules = {};
let xp_distinct = (e, i, a) => a.indexOf(e) === i;

// validate and prepare bot_module
function validateEach(mod) {
    if (!mod.keywords)
        return 'keywords required';
    if (mod.keywords.constructor !== Array)
        return 'keywords should be a string array';
    if (mod.keywords.length == 0)
        return 'keywords must have at least one element';
    for (let i = 0; i < mod.keywords.length; i++)
        if (mod.keywords[i].constructor !== String)
            return 'keywords should be a string array';

    if (!mod.name)
        mod.name = mod.keywords[0];

    if (!mod.reply)
        return 'reply function required';
    if (mod.reply.constructor !== Function)
        return 'reply should be a Function';
    /*
    if (!help) {
        mod.help = `| <${e.name}>\n| `;
        if (mod.actions)
            mod.help += '[' + mod.keywords.map(e => `"${e}"`).join(', ') + ']';
    } */
}

function validateAll() {
    // first keyword should be unique
    let firstKeywords = {};
    for (let m in _modules) {
        let first = _modules[m].keywords[0];
        if (!firstKeywords[first])
            firstKeywords[first] = [ _modules[m] ];
        else
            firstKeywords[first].push(_modules[m]);
    }

    let ok = true;
    for (let k in firstKeywords) {
        if (firstKeywords[k].length > 1) {
            ok = false;
            let list = firstKeywords[k].map(e => e.id).join('\n\t');
            log.error(`keyword '${k}' duplicated in modules:\n\t${list}`);
        }
    }

    return ok;
}

// startup
function init(cfg, cb) {
    // setup brain
    _cfg = cfg.brain;

    // setup db
    log.info(`starting brain database...`);
    _db = new db(cfg.db);
    let model = mbot.load('lib/core/model');
    _db.open(model, (er) => {
        if (er) {
            return log.error(er, () => {
                process.exit();
            });
        }

        // load/validate modules
        log.info('starting bot_modules...');
        _modules = mbot.load('bot_modules');
        for (let m in _modules) {
            let er = validateEach(_modules[m]);
            if (er) {
                delete _modules[m];
                log.error(`\tfail [${m}]: ${er}`);
            } else {
                _modules[m].id = m;
                log.info(`\tok [${m}]`);
            }
        }
        if (!validateAll())
            return shutdown(1);

        // load nlp
        let nlpName = 'nlp/' + cfg.nlp.type;
        _nlp = mbot.load(nlpName, {
            config: cfg.nlp,
            modules: _modules
        });

        // brain should be ready
        mbot.init(null, (dicAll) => {
            // nlp required
            let nlpError = dicAll[nlpName].$initError;
            if (nlpError) {
                return log.error(`lib/core/brain.init@nlp: ${nlpError}`, () => {
                    shutdown(1);
                });
            }
            
            // setup adapter (last thing!)
            let adapterName = 'adapters/' + cfg.adapter.type;
            log.info(`starting ${adapterName}...`);

            mbot.init({
                [adapterName]: { config: cfg.adapter }
            }, (dicAdapter) => {
                _adapter = dicAdapter[adapterName];
                let adpError = _adapter.$initError;
            
                if (adpError) {
                    return log.error(`lib/core/brain.init@adapter: ${adpError}`, () => {
                        shutdown(1);
                    });
                } else {
                    // ready
                    _adapter.onEvent(reply);
                }

                if (cb) cb();
            }); 
        });
    });
}

function shutdown(status) {
    // modules dispose
    mbot.dispose(() => {
        // main db dispose
        _db.dispose(() => {
            log.info(`shutting down (status ${status})`, (er) => {
                if (er) console.log(`core/brain.shutdown, log.dispose: ${er}.`);
                process.exit(status);
            });
        });
    });
}

process.on('SIGINT', () => {
   shutdown(2);
});

function helpList() {
    if (!_help) {
        _help = '|';
        for (let m in _modules) {
            let e = _modules[m];
            
            // public?
            if (!e.users) {
                _help += `\n| #${e.keywords[0]}`;
                if (e.actions)
                    _help += ' (' + Object.keys(e.actions).join(', ') + ')';
                if (e.help)
                    _help += '\n|\t' + e.help.replace(/\n/g,'\n| \t');
                /*
                else
                    _help += '[' + e.keywords.map(e => `"${e}"`).join(', ') + ']';
                _help += '\n|\n';
                */
            }
        };
        _help += '\n|\n';
    }
    return _help;
}

function reply(ii, cb) {
    // check admin commands
    if (_cfg.admin.users.includes(ii.from)) {
        if (ii.text === _cfg.admin.command.quit) {
            shutdown(0);
            // close adapter
            return cb('close');
        }
    }

    // check global commands
    let text_trim = ii.text.trim();

    if (text_trim === '') {
        return cb(null, {
            text: _cfg.message.unknown
        });
    }

    if (text_trim.toLowerCase() === _cfg.global.command.help) {
        return cb(null, {
            text: helpList()
        });
    }

    // db record
    let dbDialog = {
        user: {
            name: ii.from
        },
        request: ii.text.substr(0, 255)
    };

    // bots interface
    let dialog = {
        from: ii.from,
        text: ii.text,
        action: '',
        entities: [],
        nonEntities: []
    }

    _nlp.classify(dialog, (er, intents) => {
        // error
        if (er) {
            log.error(`lib/core/brain.classify: ${er}`);
            let text = format.string(_cfg.message.error, 'classifier');
            return cb(null, {text});
        }

        intents = intents || []; // default

        dbDialog.intents = intents.length;

        // save unknown
        if (intents.length !== 1) {
            _db.model.dialog.createWithUser(dbDialog, (er, oo) => {
                if (er) log.error(`lib/core/brain.reply (save unknown): ${er}`);
            });
        }
        
        // none
        if (intents.length === 0) {
            let text = _cfg.message.unknown;
            return cb(null, {text});
        }

        // multiple intents
        if (intents.length > 1) {
            let bots_id = intents.map(b => b.bot_id).filter(xp_distinct);

            // multiple bots
            if (bots_id.length > 2) {
                let text = _cfg.message.unknown;
                return cb(null, {text});
            }

            // one/two bots - display help(s)
            let text = bots_id.map(id => {
                let bot = _modules[id];
                return `#${bot.keywords[0]}: ${bot.help}`;
            }).join('\n');
            return cb(null, {text});
        }

        // one bot
        let bot = _modules[intents[0].bot_id];
        dialog.action = intents[0].action;
        try {
            // async call
            bot.reply(dialog, (er, oo) => {
                if (er) {
                    log.error(`lib/core/brain.mod-er (${bot.name}): ${er}`);

                    let text = format.string(_cfg.message.error, bot.name);
                    return cb(null, {text});
                }

                // format response
                let text = oo ? oo.text : bot.help;

                // save response
                if (oo) {
                    dbDialog.bot = bot.id;
                    dbDialog.reply = oo.text.substr(0, 255);
                    _db.model.dialog.createWithUser(dbDialog, (er, oo) => {
                        if (er) log.error(`lib/core/brain.reply (save): ${er}`);
                    });
                }

                return cb(null, {text});
            });
        } catch (ex) {
            log.error(`lib/core/brain.reply-ex (${bot.name}):\n${ex.stack}\n> [${dialog.text}]`);

            let text = format.string(_cfg.message.error, bot.name);
            return cb(null, {text});
        }
    });
}
