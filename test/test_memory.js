let assert = require("assert");
let chai = require("chai");
const {LRU} = require("../src/storage/memory");

describe("LRU", function () {
    it("should follow the sequence of removing nodes", ()=> {
        let lruStorage = new LRU({maxSize: 5});
        let undef = lruStorage.get(5);
        assert.strictEqual(undef, undefined);

        lruStorage.set(10, "t1");
        lruStorage.set(11, "t2");

        assert.strictEqual(lruStorage.get(11), "t2");
        let {key, value} = lruStorage.evict();
        assert.strictEqual(key, 10);
        assert.strictEqual(value, "t1");
        assert.strictEqual(lruStorage.size(), 1);
    });

    it("should evict after the lru is full", () => {
        let lruStorage = new LRU({maxSize: 5});
        for (let i = 0; i < 10; i++) {
            lruStorage.set(i, i);
        }
        assert.strictEqual(lruStorage.get(4), undefined);
        assert.strictEqual(lruStorage.size(), 5);
        let eR = lruStorage.evict();
        assert.strictEqual(eR.key, 5);
        assert.strictEqual(eR.value, 5);
        assert.strictEqual(lruStorage.size(), 4);
        lruStorage.evict();
        lruStorage.evict();
        lruStorage.evict();
        lruStorage.set(10, 10);
        assert.strictEqual(lruStorage.get(10), 10);
        assert.strictEqual(lruStorage.size(), 2);
        let {key, value} = lruStorage.evict();
        assert.strictEqual(key, 9);
        assert.strictEqual(value, 9);
        lruStorage.delete(10);
        assert.strictEqual(lruStorage.size(), 0);
        console.log(lruStorage.cache);
    });

    it("should clear everything and works properly", function() {
        let lruStorage = new LRU({maxSize: 5});
        lruStorage.set(10, 10);
        lruStorage.set(5, 8);
        lruStorage.delete(5);
        assert.strictEqual(lruStorage.get(10), 10);
        lruStorage.evict();
        lruStorage.set(15, 15);
        assert.strictEqual(lruStorage.evict().key, 15);
        lruStorage.clear();
        lruStorage.set(5, 5);
        assert.strictEqual(lruStorage.evict().value, 5);
    });
});