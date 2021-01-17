# key-value-compress

[![Node.js CI](https://github.com/kawanet/key-value-compress/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/kawanet/key-value-compress/actions/)
[![npm version](https://badge.fury.io/js/key-value-compress.svg)](https://www.npmjs.com/package/key-value-compress)

Key-Value interface to deflate, split, concatenate and inflate storage.

## SYNOPSIS

```js
const compressKVS = require("key-value-compress").compressKVS;
const axios = require("axios");
const Keyv = require("keyv");

const keyv = new Keyv();
const storage = compressKVS({storage: keyv});

async function ajaxGET(url) {
    const cache = await storage.get(url);
    if (cache) return cache;
    const {data} = await axios.get(url);
    if (data) await storage.set(url, data);
    return data;
}

const data = await ajaxGET("https://example.com/api.json");
```

See TypeScript declaration
[key-value-compress.d.ts](https://github.com/kawanet/key-value-compress/blob/main/types/key-value-compress.d.ts)
for detail.

## SEE ALSO

- https://github.com/kawanet/key-value-compress
- https://www.npmjs.com/package/key-value-compress
- https://www.npmjs.com/package/memcached-kvs

## MIT LICENSE

Copyright (c) 2021 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
