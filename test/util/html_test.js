'use strict';
let mbot = require('../../lib'),
    html = require('../../util/html'), // not mbot.load (break bootstrap)
    fs = require('fs'),
    http = require('http'),
    assert = require('assert');

let page = 'http://localhost:8181/test/util/resources/html1.htm';

function assertArray(ar, size) {
    assert(ar !== undefined, 'undefined array');
    assert(ar.constructor === Array, 'not array');
    assert(ar.length === size, 'array length: ' + ar.length);
}

// start static http server
before((done) => {
    http.createServer(function (request, response) {
        let path = mbot.path(request.url);
        fs.readFile(path, (er, da) => {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(da, 'utf-8');
        });
    }).listen(8181).on('listening', () => {
        done();
    });
});

describe('util/html', () => {
    describe('basic', () => {
        it('should return 3 records', (done) => {
            html.extract({
                page,
                selector: 'li',
                result: [{
                    name: ['a'],
                    link: ['a@href']
                }]
            }, (er, da) => {
                assertArray(da, 3);
                done();
            });
        });
    });
    
    describe('paginate', () => {
        it('should return 7 records', (done) => {
            html.extract({
                page,
                selector: ['li'],
                paginate: '.next @href'
            }, (er, da) => {
                assertArray(da, 7);
                done();
            });
        });

        describe('limit', () => {
            it('should return 6 records', (done) => {
                html.extract({
                    page,
                    selector: ['li']
                }, (er, da) => {
                    assertArray(da, 6);
                    done();
                }).paginate('.next @href').limit(2);
            });
        });
    });
});
