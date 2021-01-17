/**
 * `KVS<V>` is an interface for key-value storage, such as `keyv`.
 * https://www.npmjs.com/package/keyv
 */

export namespace KVC {
    interface KVS<V> {
        /**
         * write an item into storage
         */
        set: (key: string, value: V) => Promise<any>;

        /**
         * read an item from storage
         */
        get: (key: string) => Promise<V>;

        /**
         * remove an item from storage. optional.
         */
        delete?: (key: string) => Promise<any>;

        /**
         * test an item exists on storage. optional
         */
        has?: (key: string) => Promise<boolean>;
    }

    /**
     * `MapLike<V>` is an interface for synchronous version of `KVS<V>` such as ES6 `Map`:
     * https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map
     */

    interface MapLike<V> {
        /**
         * write an item into storage
         */
        set: (key: string, value: V) => any;

        /**
         * read an item from storage
         */
        get: (key: string) => V;

        /**
         * remove an item from storage. optional.
         */
        delete?: (key: string) => any;

        /**
         * test an item exists on storage. optional
         */
        has?: (key: string) => boolean;
    }

    /**
     * `compressKVS()` accepts option parameters via kvc.Options
     */

    interface Options {
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
        storage: KVS<Buffer | string> | MapLike<Buffer | string>;

        /**
         * key-value storage to contain meta data
         * @default `undefined` to use `storage` both for content chunks and meta data.
         */
        metaStorage?: KVS<string> | MapLike<string>;

        /**
         * prefix string to prepend for keys of meta data storage
         */
        metaNS?: string;

        /**
         * prefix string to prepend for keys of content chunk storage
         */
        chunkNS?: string;
    }
}

/**
 * `compressKVS()` convert KVS or MapLike to KVS with content compression.
 */

export function compressKVS<V = any>(options: KVC.Options): KVC.KVS<V>;
