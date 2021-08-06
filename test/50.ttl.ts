#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {compressKVS} from "../lib/key-value-compress";
import {TimedKVS} from "timed-kvs";

const TESTNAME = __filename.replace(/^.*\//, "");
const WAIT = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

describe(TESTNAME, () => {
    const ttl = 100;

    it("{ttl: 100, storage: new Map()}", async () => {
        const storage = new Map<string, string>();
        const kvc = compressKVS<string>({ttl, storage});
        await kvc.set("foo", "FOO");
        await WAIT(10);
        assert.equal(await kvc.get("foo"), "FOO");
        await WAIT(50);
        assert.equal(await kvc.get("foo"), "FOO");
        await WAIT(50);
        assert.equal(await kvc.get("foo") || "empty", "empty", "should be expired by compressKVS");
    });

    it("{ttl: 100, storage: new TimedKVS({expires: 150})}", async () => {
        const storage = new TimedKVS<string>({expires: 150});
        const kvc = compressKVS<string>({ttl, storage});
        await kvc.set("foo", "FOO");
        await WAIT(10);
        assert.equal(await kvc.get("foo"), "FOO");
        await WAIT(50);
        assert.equal(await kvc.get("foo"), "FOO");
        await WAIT(50);
        assert.equal(await kvc.get("foo") || "empty", "empty", "should be expired by compressKVS");
    });

    it("{ttl: 100, storage: new TimedKVS({expires: 50})}", async () => {
        const storage = new TimedKVS<string>({expires: 50});
        const kvc = compressKVS<string>({ttl, storage});
        await kvc.set("foo", "FOO");
        await WAIT(10);
        assert.equal(await kvc.get("foo"), "FOO");
        await WAIT(50);
        assert.equal(await kvc.get("foo") || "empty", "empty", "should be expired by TimedKVS");
    });
});
