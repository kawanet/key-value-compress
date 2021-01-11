/**
 * _util.ts
 */

import * as crypto from "crypto";
import {KVS} from "../types/key-value-compress";
import {transformKVS} from "./_transform";

/**
 * generate digest hash string for Buffer
 */

export function digestBuffer(algorithm: string, chunk: Buffer): string {
    return crypto.createHash(algorithm).update(chunk).digest("hex");
}

/**
 * split a large Buffer to smaller chunks
 */

export function splitBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
    const chunks = [] as Buffer[];
    let start = 0;
    const total = buffer.length;
    if (total < chunkSize) return [buffer];

    while (start < total) {
        const end = Math.min(start + chunkSize, total);
        const chunk = buffer.slice(start, end);
        chunks.push(chunk);
        start = end;
    }
    return chunks;
}

/**
 * concatenate Buffer chunks to a single Buffer
 */

export function concatBuffer(chunks: Buffer[]): Buffer {
    if (!chunks) return;
    if (chunks.length === 1) {
        return chunks[0]; // single chunk
    } else {
        return Buffer.concat(chunks); // multiple chunks
    }
}

type BufferEncoding = "base64";

/**
 * transform key-value storage to encode Buffer to base64 string, and vice versa
 */

export function base64KVS(storage: KVS<string>, encoding?: BufferEncoding): KVS<Buffer> {
    if (!encoding) encoding = "base64";
    return transformKVS<Buffer, string>(storage as KVS<string>, {
        // Buffer to base64
        encode: buf => buf.toString(encoding),
        // base64 to Buffer
        decode: str => Buffer.from(str || "", encoding),
    });
}
