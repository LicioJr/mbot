'use strict';
// imports
let mbot = require('../../lib'),
    config = mbot.config('examples/google'),
    html = mbot.load('util/html');

module.exports = {
    latestNews
}

function latestNews(ii, cb) {
    let page = config.news[ii.topic];
    html.extract({
        page,
        selector: ['main > div > c-wiz > div > c-wiz > c-wiz > div > div > c-wiz > a']
    }, cb);
}
