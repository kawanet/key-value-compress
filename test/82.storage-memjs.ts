#!/usr/bin/env mocha -R spec

/**
 * @example
 * docker run -d -p 11211:11211 --name memcached memcached
 * MEMCACHE_SERVERS=localhost:11211 mocha test/82.storage-memjs.js
 */

import {strict as assert} from "assert";
import {Client} from "memjs";

import {compressKVS, KVS} from "../lib/key-value-compress";

const TESTNAME = __filename.replace(/^.*\//, "");

// run this test only when environment variable specified
const {MEMCACHE_SERVERS} = process.env;
const DESCRIBE = MEMCACHE_SERVERS ? describe : describe.skip;

// an unique prefix added for test purpose
const PREFIX = TESTNAME + ":" + Date.now() + ":";

DESCRIBE(TESTNAME, () => {
    let client: Client;
    let storage: KVS<Buffer>;

    before(() => {
        client = require("memjs").Client.create(MEMCACHE_SERVERS, {expires: 60});

        storage = {
            get: async (key) => (await client.get(PREFIX + key))?.value,
            set: async (key, value) => client.set(PREFIX + key, value, {}),
        };
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
