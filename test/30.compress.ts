#!/usr/bin/env mocha -R spec

import * as zlib from "zlib";
import {strict as assert} from "assert";
import {compressKVS} from "../lib/key-value-compress";

const TESTNAME = __filename.replace(/^.*\//, "");

describe(TESTNAME, () => {
    const inlineSize = 0;

    it("deflate", async () => {
        const storage = new Map<string, Buffer>();
        const metaStorage = new Map<string, string>();
        const compress = "deflate";
        const kvc = compressKVS<string>({compress, inlineSize, metaStorage, storage});

        await kvc.set("foo", "FOO");
        assert.deepEqual(await kvc.get("foo"), "FOO");

        const buffer = storage.values().next().value;
        assert.equal(zlib.inflateSync(buffer).toString(), "FOO");
    });

    it("brotli", async () => {
        const storage = new Map<string, Buffer>();
        const metaStorage = new Map<string, string>();
        const compress = "brotli";
        const kvc = compressKVS<string>({compress, inlineSize, metaStorage, storage});

        await kvc.set("bar", "BAR");
        assert.deepEqual(await kvc.get("bar"), "BAR");

        const buffer = storage.values().next().value;
        assert.equal(zlib.brotliDecompressSync(buffer).toString(), "BAR");
    });
});
