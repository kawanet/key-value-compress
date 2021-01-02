/**
 * _transform.ts
 */

import {KVS} from "./key-value-compress";

/**
 * wrap key-value storage to prepend a prefix string for storage keys
 */

export function namespaceKVS<V>(storage: KVS<V>, prefix: string): KVS<V> {
    return storage?.delete ? {get, set, delete: remove} : {get, set};

    function set(key: string, value: V) {
        if (prefix) key = prefix + key;
        return storage.set(key, value);
    }

    function get(key: string) {
        if (prefix) key = prefix + key;
        return storage.get(key);
    }

    function remove(key: string) {
        if (prefix) key = prefix + key;
        return storage.delete(key);
    }
}

interface Encoder<V, S = V> {
    encode: (value: V) => S;
    decode: (value: S) => V;
}

/**
 * transform key-value storage to apply encode() and decode() methods
 */

export function transformKVS<V = any, S = V>(storage: KVS<S>, transform: Encoder<V, S>): KVS<V> {
    return storage?.delete ? {get, set, delete: key => storage.delete(key)} : {get, set};

    async function set(key: string, value: V): Promise<void> {
        const encoded = transform.encode(value);
        await storage.set(key, encoded);
    }

    async function get(key: string): Promise<V> {
        const value = await storage.get(key);
        if ("undefined" === typeof value) return;
        return transform.decode(value);
    }
}

/**
 * transform key-value storage to encode object V to JSON string, and vice versa
 * @param storage
 */

export function jsonKVS<V>(storage: KVS<string>): KVS<V> {
    return stringifyKVS<V>(storage, JSON);
}

interface Stringifyer<V> {
    stringify: (value: V) => string;
    parse: (value: string) => V;
}

/**
 * transform key-value storage to apply stringify() and parse() methods
 */

export function stringifyKVS<V>(storage: KVS<string>, stringifyer: Stringifyer<V>): KVS<V> {
    return transformKVS<V, string>(storage, {
        encode: stringifyer.stringify,
        decode: stringifyer.parse,
    });
}
