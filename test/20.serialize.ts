#!/usr/bin/env mocha -R spec

/**
 * the test may be separated to another module later
 */

import {strict as assert} from "assert";
import {encodeKVS, stringifyKVS} from "../lib/_transform";

const TESTNAME = __filename.replace(/^.*\//, "");

describe(TESTNAME, () => {

    it("encodeKVS (msgpack-lite)", async () => {
        const storage = new Map<string, Buffer>();

        const msgpack = require("msgpack-lite");
        type V = { buf: Buffer };
        const kvs = encodeKVS<V, Buffer>(storage, msgpack);

        await kvs.set("foo", {buf: Buffer.from("FOO")});
        assert.deepEqual((await kvs.get("foo"))?.buf, Buffer.from("FOO"));

        const encoded = storage.values().next().value;
        assert.equal(Buffer.isBuffer(encoded), true);
        assert.equal(Object.keys(msgpack.decode(encoded)).shift(), "buf");
    });

    it("stringifyKVS (json-buffer)", async () => {
        const storage = new Map<string, string>();

        const JSONB = require("json-buffer");
        type V = { buf: Buffer };
        const kvs = stringifyKVS<V>(storage, JSONB);

        await kvs.set("foo", {buf: Buffer.from("FOO")});
        assert.deepEqual((await kvs.get("foo"))?.buf, Buffer.from("FOO"));

        const encoded = storage.values().next().value;
        assert.equal(typeof encoded, "string");
        assert.equal(Object.keys(JSON.parse(encoded)).shift(), "buf");
    });

    it("stringifyKVS (buffer-json)", async () => {
        const storage = new Map<string, string>();

        const BJSON = require("buffer-json");
        type V = { buf: Buffer };
        const kvs = stringifyKVS<V>(storage, BJSON);

        await kvs.set("foo", {buf: Buffer.from("FOO")});
        assert.deepEqual((await kvs.get("foo"))?.buf, Buffer.from("FOO"));

        const encoded = storage.values().next().value;
        assert.equal(typeof encoded, "string");
        assert.equal(Object.keys(JSON.parse(encoded)).shift(), "buf");
    });
});
