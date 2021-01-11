/**
 * _transform.ts
 */

import {KVS, MapLike} from "../types/key-value-compress";

/**
 * wrap key-value storage to prepend a prefix string for storage keys
 */

export function namespaceKVS<V>(storage: (KVS<V> | MapLike<V>), prefix: string) {
    if (!prefix) return storage;

    return keyFilterKVS(storage, key => prefix + key);
}

export function keyFilterKVS<V>(storage: (KVS<V> | MapLike<V>), filter: (key: string) => string) {
    const out = {} as typeof storage;

    out.get = (key: string) => storage.get(filter(key)) as any;

    out.set = (key: string, value: V) => storage.set(filter(key), value);

    if (storage.delete) out.delete = (key: string) => storage.delete(filter(key));

    if (storage.has) out.has = (key: string) => storage.has(filter(key)) as any;

    return out;
}

interface EncodeDecode<V, S = V> {
    encode: (value: V) => S;
    decode: (value: S) => V;
}

/**
 * transform key-value storage to apply encode() and decode() methods
 */

export function transformKVS<V, S>(storage: (KVS<S> | MapLike<S>), filter: EncodeDecode<V, S>): KVS<V> {
    const out = {} as KVS<V>;

    out.get = async (key: string) => {
        const value = await storage.get(key);
        if ("undefined" === typeof value) return;
        return filter.decode(value);
    };

    out.set = async (key: string, value: V) => storage.set(key, filter.encode(value));

    if (storage.delete) out.delete = async (key: string) => storage.delete(key);

    if (storage.has) out.has = async (key: string) => storage.has(key);

    return out;
}

/**
 * transform key-value storage to encode object V to JSON string, and vice versa
 * @param storage
 */

export function jsonKVS<V>(storage: (KVS<string> | MapLike<string>)): KVS<V> {
    return stringifyKVS<V>(storage, JSON);
}

interface StringifyParse<V> {
    stringify: (value: V) => string;
    parse: (value: string) => V;
}

/**
 * transform key-value storage to apply stringify() and parse() methods
 */

export function stringifyKVS<V>(storage: (KVS<string> | MapLike<string>), filter: StringifyParse<V>): KVS<V> {
    return transformKVS<V, string>(storage, {
        encode: value => filter.stringify(value),
        decode: value => filter.parse(value),
    });
}
