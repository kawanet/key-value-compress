#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {compressKVS} from "../lib/key-value-compress";

const TESTNAME = __filename.replace(/^.*\//, "");

describe(TESTNAME, () => {
    const inlineSize = 0;

    it("storage", async () => {
        const storage = new Map<string, Buffer>();
        const kvc = compressKVS({inlineSize, storage});

        await kvc.set("foo", {FOO: 1});
        await kvc.set("bar", {BAR: 2});
        assert.deepEqual(await kvc.get("foo"), {FOO: 1});
        assert.deepEqual(await kvc.get("bar"), {BAR: 2});

        assert.equal(storage.size, 4);
        assert.equal(storage.has("foo"), true);
        assert.equal(storage.has("bar"), true);
    });

    it("metaStorage", async () => {
        const storage = new Map<string, Buffer>();
        const metaStorage = new Map<string, string>();
        const kvc = compressKVS({inlineSize, storage, metaStorage});

        await kvc.set("foo", {FOO: 1});
        assert.deepEqual(await kvc.get("foo"), {FOO: 1});

        assert.equal(storage.size, 1);
        assert.equal(metaStorage.size, 1);
        assert.equal(metaStorage.has("foo"), true);
        assert.equal(Buffer.isBuffer(storage.values().next().value), true);
        assert.equal(typeof (metaStorage.values().next().value), "string");
    });

    it("encoding", async () => {
        const storage = new Map<string, Buffer>();
        const metaStorage = new Map<string, string>();
        const encoding = "base64";
        const kvc = compressKVS({inlineSize, storage, metaStorage, encoding});

        await kvc.set("bar", {BAR: 2});
        assert.deepEqual(await kvc.get("bar"), {BAR: 2});

        assert.equal(storage.size, 1);
        assert.equal(metaStorage.size, 1);
        assert.equal(metaStorage.has("bar"), true);

        assert.equal(typeof (storage.values().next().value), "string");
        assert.equal(typeof (metaStorage.values().next().value), "string");
    });

    it("metaNS, chunkNS", async () => {
        const storage = new Map<string, Buffer>();
        const metaStorage = new Map<string, string>();

        type V = { val: string };
        const metaNS = "meta:";
        const chunkNS = "chunk:"
        const kvc = compressKVS<V>({inlineSize, storage, metaStorage, metaNS, chunkNS});

        await kvc.set("foo", {val: "FOO"});
        await kvc.set("bar", {val: "BAR"});
        assert.deepEqual(await kvc.get("foo"), {val: "FOO"});
        assert.deepEqual(await kvc.get("bar"), {val: "BAR"});

        assert.equal(metaStorage.has("meta:foo"), true);
        assert.equal(metaStorage.has("meta:bar"), true);
        assert.equal(/^chunk:\w/.test(storage.keys().next().value), true);
    });

    it("chunkSize", async () => {
        const storage = new Map<string, Buffer>();
        const metaStorage = new Map<string, string>();
        const chunkSize = 10;
        const kvc = compressKVS({inlineSize, storage, metaStorage, chunkSize});

        await kvc.set("qux", {QUX: 4});
        assert.deepEqual(await kvc.get("qux"), {QUX: 4});

        assert.equal(metaStorage.has("qux"), true);
        assert.equal(storage.values().next().value.length, chunkSize);
    });
});
