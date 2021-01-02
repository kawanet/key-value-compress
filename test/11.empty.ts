#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {compressKVS} from "../lib/key-value-compress";

const TESTNAME = __filename.replace(/^.*\//, "");

describe(TESTNAME, () => {
    const inlineSize = 0;

    it("null", async () => {
        const storage = new Map<string, Buffer>();
        const kvc = compressKVS({inlineSize, storage});

        await kvc.set("foo", null);
        assert.equal(storage.size, 2);

        assert.deepEqual(await kvc.get("foo"), null);
    });

    it("false", async () => {
        const storage = new Map<string, Buffer>();
        const kvc = compressKVS({inlineSize, storage});

        await kvc.set("foo", false);
        assert.equal(storage.size, 2);

        assert.deepEqual(await kvc.get("foo"), false);
    });

    it("empty string", async () => {
        const storage = new Map<string, Buffer>();
        const kvc = compressKVS({inlineSize, storage});

        await kvc.set("foo", "");
        assert.equal(storage.size, 2);

        assert.deepEqual(await kvc.get("foo"), "");
    });

    it("empty Buffer", async () => {
        const storage = new Map<string, Buffer>();
        const kvc = compressKVS({inlineSize, storage});

        await kvc.set("foo", Buffer.alloc(0));
        assert.equal(storage.size, 2);

        assert.deepEqual(await kvc.get("foo"), Buffer.alloc(0));
        assert.equal(Buffer.isBuffer(await kvc.get("foo")), true);
    });

    it("empty key", async () => {
        const storage = new Map<string, Buffer>();
        const kvc = compressKVS({inlineSize, storage});

        await kvc.set("", "foo");
        assert.equal(storage.size, 2);

        assert.deepEqual(await kvc.get(""), "foo");
    });
});
