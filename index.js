"use strict";
const createHash = require("webpack/lib/util/createHash");
import { validate } from 'schema-utils';
const path = require('path')
const schema = require("webpack/schemas/plugins/HashedModuleIdsPlugin.json");

const PLUGIN_NAME = 'HashedChunkIdsPlugin';

class HashedChunkIdsPlugin {
  constructor(options) {
    if (!options) options = {};
    validate(schema, options, {name: PLUGIN_NAME});
    this.options = Object.assign(
      {
        context: null,
        hashFunction: "md5",
        hashDigest: "hex",
        hashDigestLength: 5 
      },
      options
    );
  }

  apply(compiler) {
    const options = this.options;
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      const usedIds = new Set();
      compilation.hooks.beforeChunkIds.tap(PLUGIN_NAME,
        chunks => {
          for (const chunk of chunks) {
            if (chunk.id === null) {
              let _chuckPath =
                (chunk.entryModule && chunk.entryModule.resource) ||
                (chunk.entryModule && chunk.entryModule.name) ||
                chunk.name
              console.log(`${PLUGIN_NAME}: chunk path: ${_chuckPath}`)
              if (_chuckPath) {
                _chuckPath = path.relative('./', _chuckPath)
                const hash = createHash(options.hashFunction);
                hash.update(_chuckPath);
                const hashId = hash.digest(options.hashDigest);
                let len = options.hashDigestLength;
                while (usedIds.has(hashId.substr(0, len))) len++;
                chunk.id = hashId.substr(0, len);
                usedIds.add(chunk.id);
              }
            }
          }
        }
      );
    });
  }
}

module.exports = HashedChunkIdsPlugin;
