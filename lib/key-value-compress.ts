/**
 * key-value-compress.ts
 */

import {KVC} from "../types/key-value-compress";
import * as _compress from "./_compress";
import {namespaceKVS, stringifyKVS} from "./_transform";
import {base64KVS, concatBuffer, digestBuffer, splitBuffer} from "./_util";

type KVS<T> = KVC.KVS<T>;

const enum defaults {
    version = 2, // version
    chunkSize = 491520, // 480KB
    compress = "deflate",
    digest = "sha1",
    inlineSize = 1024, // 1KB
}

interface KVCMeta {
    v: number;
    type: string;
    chunks: string[];
    inline?: { [digest: string]: string };
    dt?: number;
}

/**
 * Key-Value storage interceptor to deflate, split, concatenate and inflate content
 */

export function compressKVS<V = any>(options: KVC.Options): KVS<V> {
    let {chunkNS, chunkSize, compress, digest, encoding} = options || {};
    let {inlineSize, metaNS, metaStorage, storage, ttl} = options || {};

    if (!metaStorage) metaStorage = storage as any;
    if (metaNS) metaStorage = namespaceKVS(metaStorage, metaNS);
    const metaKSV = stringifyKVS<KVCMeta>(metaStorage, JSON);

    if (chunkNS) storage = namespaceKVS(storage, chunkNS);
    if (encoding) storage = base64KVS(storage as KVS<string>, encoding);

    let compressor = _compress[compress || defaults.compress];

    if (inlineSize == null) inlineSize = defaults.inlineSize;
    if (!chunkSize) chunkSize = defaults.chunkSize;
    if (!digest) digest = defaults.digest;

    return {get, set};

    async function set(key: string, value: V): Promise<void> {
        const meta = {v: defaults.version, chunks: []} as KVCMeta;

        let raw: Buffer;
        if (Buffer.isBuffer(value)) {
            raw = value;
            meta.type = "Buffer";
        } else {
            if ("string" === typeof value) {
                raw = Buffer.from(value);
                meta.type = "string";
            } else {
                raw = Buffer.from(JSON.stringify(value));
                meta.type = "JSON";
            }
        }

        if (+ttl) {
            meta.dt = +Date.now();
        }

        const compressed = await compressor.compress(raw);
        const chunks = splitBuffer(compressed, chunkSize);

        for (let chunk of chunks) {
            const hash = digestBuffer(digest, chunk);

            if (chunk.length <= inlineSize) {
                const inline = meta.inline || (meta.inline = {});
                inline[hash] = chunk.toString("base64");
            } else {
                await storage.set(hash, chunk);
            }

            meta.chunks.push(hash);
        }

        await metaKSV.set(key, meta);
    }

    async function get(key: string): Promise<V> {
        const meta = await metaKSV.get(key);
        if (!meta) return;
        const {inline, chunks, dt, v} = meta;

        // reject data when stored with a future version of the library
        if (!+v || v > defaults.version) throw Error(`Invalid storage version: ${v}`);

        if (!chunks) return;
        if (!chunks.length) return;

        if (ttl) {
            if (!dt) return;
            if (dt < Date.now() - ttl) return;
        }

        const array = [] as Buffer[];
        for (const hash of chunks) {
            const base64 = inline && inline[hash];
            let chunk: Buffer;

            if (base64) {
                chunk = Buffer.from(base64, "base64");
            } else {
                chunk = await storage.get(hash) as Buffer;
            }

            if (!chunk) return;
            const check = digestBuffer(digest, chunk);
            if (check !== hash) return;
            array.push(chunk);
        }

        const joined = concatBuffer(array);
        const buffer = await compressor.decompress(joined);
        if (!buffer) return;

        let value: V;
        if (meta.type === "Buffer") {
            value = buffer as any;
        } else if (meta.type === "string") {
            value = buffer.toString() as any;
        } else {
            value = JSON.parse(buffer as any);
        }

        return value;
    }
}
