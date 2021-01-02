/**
 * key-value-compress.ts
 */

export interface KVS<V> {
    /**
     * write an item into storage
     */
    set: (key: string, value: V) => void | Promise<void> | any;

    /**
     * read an item from storage
     */
    get: (key: string) => V | Promise<V>;

    /**
     * remove an item from storage. optional.
     */
    delete?: (key: string) => void | Promise<void> | any;
}

export interface CompressOptions {
    /**
     * Compression format
     * @default `deflate`
     */
    compress?: ("raw" | "deflate" | "brotli");

    /**
     * maximum byte length for a larger content to split into multiple data chunk records
     * @default `491520` = 480KB < 493552 bytes to contain 2 chunks per 1MB slab
     */
    chunkSize?: number;

    /**
     * minimum byte length for smaller content to be embedded into meta record
     * @default `1024` = 1KB
     */
    inlineSize?: number;

    /**
     * digest algorithm to calculate hash string for each content data chunk
     * @default `sha1`
     */
    digest?: string;

    /**
     * @default `undefined` to use Buffer
     */
    encoding?: ("base64" | undefined);

    /**
     * key-value storage to contain compressed content chunks
     */
    storage: KVS<Buffer | string>;

    /**
     * key-value storage to contain meta data
     * @default `undefined` to use `storage` both for content chunks and meta data.
     */
    metaStorage?: KVS<string>;

    /**
     * prefix string to prepend for keys of meta data storage
     */
    metaNS?: string;

    /**
     * prefix string to prepend for keys of content chunk storage
     */
    chunkNS?: string;
}

export function compressKVS<V = any>(options: CompressOptions): KVS<V>;
