#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as crypto from "crypto";
import {compressKVS} from "../lib/key-value-compress";

const TESTNAME = __filename.replace(/^.*\//, "");

describe(TESTNAME, () => {
    const inlineSize = 0;

    it("sha1 (default)", async () => {
        const storage = new Map<string, Buffer>();
        const metaStorage = new Map<string, string>();
        const kvc = compressKVS({inlineSize, storage, metaStorage});
        await kvc.set("foo", "FOO");
        assert.equal(await kvc.get("foo"), "FOO");

        const compressed = storage.values().next().value;
        const digest = crypto.createHash("sha1").update(compressed).digest("hex");
        assert.equal(storage.keys().next().value, digest);
    });

    it("sha256", async () => {
        const storage = new Map<string, Buffer>();
        const metaStorage = new Map<string, string>();
        const kvc = compressKVS({inlineSize, storage, metaStorage, digest: "sha256"});
        await kvc.set("bar", "BAR");
        assert.equal(await kvc.get("bar"), "BAR");

        const compressed = storage.values().next().value;
        const digest = crypto.createHash("sha256").update(compressed).digest("hex");
        assert.equal(storage.keys().next().value, digest);
    });
});
