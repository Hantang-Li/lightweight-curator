const Keyv = require("keyv");
const {MemoryStorageError, KeyNotFoundInStorageError} = require("../errors");

class LRU_Node {
    constructor(key, value, onEviction = undefined, next_ = null, prev_ = null) {
        this.key = key;
        this.value = value;
        this.onEviction = onEviction;
        this.next = next_;
        this.prev = prev_;
    }
}

class LRU {
    constructor(opts = {}) {
        this.maxSize = opts.maxSize;
        this.onEviction = opts.onEviction;
        this.cache = new Map();
        this._size = 0;
        this.head = null;
    }
    /**
     * 
     * @param {LRU_Node} lruNode new LRU node
     */
    _appendToHead(lruNode) {
        
        if (this.head == null) {
            lruNode.prev = lruNode;
            lruNode.next = lruNode;
            this.head = lruNode;
            return;
        }

        lruNode.next = this.head;
        let lastNode = this.head.prev;
        lruNode.prev = lastNode;
        lastNode.next = lruNode;
        this.head.prev = lruNode;
        this.head = lruNode;
    }
    /**
     * 
     * @param {LRU_Node} lruNode existing LRU node
     */
    _moveNodeToRecent(lruNode) {
        this._removeNode(lruNode);
        this._appendToHead(lruNode);
    }
    /**
     * 
     * @param {LRU_Node} lruNode existing LRU node
     */
    _removeNode(lruNode) {
        let prev = lruNode.prev;
        let next = lruNode.next;

        prev.next = next;
        next.prev = prev;

        lruNode.next = null;
        lruNode.prev = null;

        if (lruNode.key == this.head.key) {
            if (next.key == lruNode.key && prev.key == lruNode.key) {
                this.head = null;
            } else {
                this.head = next;
            }
        }

        return lruNode;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            let node = this.cache.get(key);
            this._moveNodeToRecent(node);
            node.value = value;
        } else {
            let newLRUNode = new LRU_Node(key, value, this.onEviction, null, null);
            this._appendToHead(newLRUNode);
            this._size++;
            this.cache.set(key, newLRUNode);
            this.batchEvict();
        }
    }

    get(key) {
        if (this.cache.has(key)) {
            let lruNode = this.cache.get(key);
            this._moveNodeToRecent(lruNode);
            return lruNode.value;
        }

        else {
            return undefined;
        }
    }

    delete(key) {
        if (this.cache.has(key)) {
            let node = this.cache.get(key);
            this.cache.delete(key);
            this._removeNode(node);
            this._size--;
            return true;
        }
        
        return false;
    }

    batchEvict() {
        for (let i = 0; i < this._size - this.maxSize; i++) {
            this.evict();
        }
    }
    /**
     * evict node in LRU
     */
    evict() {
        if (this.head == null) return {};
        let lastNode = this.head.prev;
        this._removeNode(lastNode);
        this._size--;
        this.cache.delete(lastNode.key);
        if (typeof lastNode.onEviction == "function") {
            lastNode.onEviction(lastNode.key, lastNode.value);
        }
        return {key: lastNode.key, value: lastNode.value};
    }

    clear() {
        this._size = 0;
        this.cache.clear();
        this.head = null;
    }

    size() {
        return this._size;
    }

    resize(newSize) {
        this.maxSize = newSize;
    }
}

const storages = {
    LRUStorage: new LRU({maxSize: 1000})
}

async function saveToLRUMem(rcMessage) {
    let {LRUStorage} = storages;
    let kv = new Keyv({store: LRUStorage});
    let isSuccessful = await kv.set(rcMessage.key, rcMessage.msg);

    if (!isSuccessful) {
        throw new MemoryStorageError("Memory storage for LRU failed!");
    }
}

async function getFromLRUMem(rcMessage) {
    let {LRUStorage} = storages;
    let kv = new Keyv({store: LRUStorage});
    let result = await kv.get(rcMessage.key);

    if (typeof result == "undefined") {
        throw new KeyNotFoundInStorageError("LRU doesn't have such a key");
    }

    return result;
}

module.exports = {
    saveToLocalMem: saveToLRUMem,
    getFromLocalMem: getFromLRUMem,
    LRU: LRU
}