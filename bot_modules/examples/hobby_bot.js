'use strict';
let mbot = require('../../lib'),
    kb = mbot.load('kb/examples/hobby_kb');

module.exports = {
    name: 'hobby list',
    keywords: ['hobby'],
    actions: {
        add: ['new', 'create'],
        remove: ['delete', 'purge'],
        list: ['show', 'my']
    },
    help: 'Manages a hobby list, examples:'
        + '\n> include a new hobby Carpentry'
        + '\n> show my hobbies'
        + '\n> remove hobby "Carpentry"'
        + '\n> show "peter@server" hobbies',
    reply
}

function reply(dialog, cb) {
    let act = dialog.action;
    let user = dialog.from;

    // #hobby (self list)
    if (act == 'list') {
        // #hobby "user" (user list)
        let otherUser = dialog.entities[0];

        if (otherUser)
            return kb.listHobbies({
                user: otherUser
            }, (er, ar) => {
                if (er) return cb(er);

                let text = (ar.length == 0 ?
                    `User ${otherUser} has no hobbies registered.` :
                    `${otherUser} hobbies are:\n` + ar.join('\n'));
                
                return cb(null, { text });
            });
        else
            return kb.listHobbies({
                user
            }, (er, ar) => {
                if (er) return cb(er);

                let text = (ar.length == 0 ?
                    'You have no hobbies registered' :
                    'Your hobbies are:\n' + ar.join('\n'));
                
                return cb(null, { text });
            });
    }
 
    if (dialog.entities.length == 0)
        return cb();

    if (act == 'add' || act == 'remove') {
        let hobby = dialog.entities[0];

        if (act == 'add') {
            // #hobby add "x"
            return kb.addHobby({ user, hobby }, (er) => {
                if (er) return cb(er);

                return cb(null, {
                    text: `Hobby ${hobby} registered.`
                });
            });
        } else {
            // #hobby remove "x"
            return kb.removeHobby({ user, hobby }, (er) => {
                if (er) return cb(er);

                return cb(null, {
                    text: `Hobby ${hobby} unregistered.`
                });
            });
        }
    }
    
    cb();
}
