#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {compressKVS} from "../lib/key-value-compress";

const TESTNAME = __filename.replace(/^.*\//, "");


describe(TESTNAME, () => {
    const encoding = "base64";

    it("unchanged version number", async () => {
        const storage = new Map<string, string>();
        const kvc = compressKVS({storage, encoding});

        await kvc.set("foo", "FOO");
        assert.equal(await kvc.get("foo"), "FOO");

        const data = JSON.parse(storage.get("foo"));
        assert.ok(data.v, `it should have a version number`);
        storage.set("foo", JSON.stringify(data));

        assert.equal(await kvc.get("foo"), "FOO", `it should be readable`);
    });

    it("increment version number", async () => {
        const storage = new Map<string, string>();
        const kvc = compressKVS({storage, encoding});

        await kvc.set("foo", "FOO");
        await assert.doesNotReject(() => kvc.get("foo"));

        const data = JSON.parse(storage.get("foo"));
        data.v++; // increment
        storage.set("foo", JSON.stringify(data));

        await assert.rejects(() => kvc.get("foo"), `it should be rejected`);
    });

    it("decrement version number", async () => {
        const storage = new Map<string, string>();
        const kvc = compressKVS({storage, encoding});

        await kvc.set("foo", "FOO");
        await assert.doesNotReject(() => kvc.get("foo"));

        const data = JSON.parse(storage.get("foo"));
        data.v--; // decrement
        storage.set("foo", JSON.stringify(data));

        await assert.doesNotReject(() => kvc.get("foo"), `it should be readable`);
        assert.equal(await kvc.get("foo"), "FOO");
    });

    it("undefined version number", async () => {
        const storage = new Map<string, string>();
        const kvc = compressKVS({storage, encoding});

        await kvc.set("foo", "FOO");
        await assert.doesNotReject(() => kvc.get("foo"));

        const data = JSON.parse(storage.get("foo"));
        delete data.v; // removed
        storage.set("foo", JSON.stringify(data));

        await assert.rejects(() => kvc.get("foo"), `it should be rejected`);
    });
});
