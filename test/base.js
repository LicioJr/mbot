let assert = require('assert'),
    index = require('../index');

describe('base', function() {
    it('hello(hi)', function(){
        let text = index.hello('hi');
        assert.strictEqual(text, 'v0.0.2: hi', text);
    });
})