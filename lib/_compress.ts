/**
 * _compress.ts
 */

import * as zlib from "zlib";

export interface Compressor {
    compress: (buffer: Buffer) => Buffer | Promise<Buffer>;
    decompress: (buffer: Buffer) => Buffer | Promise<Buffer>;
}

export const deflate: Compressor = {
    compress: zlib.deflateSync,
    decompress: zlib.inflateSync,
};

export const brotli: Compressor = {
    compress: zlib.brotliCompressSync,
    decompress: zlib.brotliDecompressSync,
};

export const raw: Compressor = {
    compress: buf => buf,
    decompress: buf => buf,
}