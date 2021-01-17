#!/usr/bin/env mocha -R spec

/**
 * @example
 * docker run -d -p 11211:11211 --name memcached memcached
 * MEMCACHE_SERVERS=localhost:11211 mocha test
 */

import {strict as assert} from "assert";
import {bufferKVS} from "memcached-kvs";

import {compressKVS} from "../lib/key-value-compress";

const TESTNAME = __filename.replace(/^.*\//, "");

// run this test only when environment variable specified
const {MEMCACHE_SERVERS} = process.env;
const DESCRIBE = MEMCACHE_SERVERS ? describe : describe.skip;

// an unique prefix added for test purpose
const PREFIX = TESTNAME + ":" + Date.now() + ":";

DESCRIBE(TESTNAME, () => {
    const {Client} = require("memjs");
    const client = Client.create(MEMCACHE_SERVERS);

    const storage = bufferKVS({
        namespace: PREFIX,
        memjs: client,
        expires: 60, // 1 minute
    });

    after(() => {
        client.close();
    });

    it("object", async () => {
        const kvc = compressKVS({storage});

        await kvc.set("foo", {FOO: 1});
        await kvc.set("bar", {BAR: 2});

        assert.deepEqual(await kvc.get("foo"), {FOO: 1});
        assert.deepEqual(await kvc.get("bar"), {BAR: 2});
    });
});
