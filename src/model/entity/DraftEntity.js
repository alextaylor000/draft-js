/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftEntity
 * @typechecks
 * @flow
 */

var DraftEntityInstance = require('DraftEntityInstance');
var Immutable = require('immutable');

var invariant = require('invariant');

import type {DraftEntityMutability} from 'DraftEntityMutability';
import type {DraftEntityType} from 'DraftEntityType';

var {Map} = Immutable;

var instances: Map<string, DraftEntityInstance> = Map();
var instanceKey = 0;

/**
 * A "document entity" is an object containing metadata associated with a
 * piece of text in a ContentBlock.
 *
 * For example, a `link` entity might include a `uri` property. When a
 * ContentBlock is rendered in the browser, text that refers to that link
 * entity may be rendered as an anchor, with the `uri` as the href value.
 *
 * In a ContentBlock, every position in the text may correspond to zero
 * or one entities. This correspondence is tracked using a key string,
 * generated via DraftEntity.create() and used to obtain entity metadata
 * via DraftEntity.get().
 */
var DraftEntity = {
  /**
   * Create a DraftEntityInstance and store it for later retrieval.
   *
   * A random key string will be generated and returned. This key may
   * be used to track the entity's usage in a ContentBlock, and for
   * retrieving data about the entity at render time.
   */
  create: function(
    type: DraftEntityType,
    mutability: DraftEntityMutability,
    data?: Object
  ): string {
    return DraftEntity.add(
      new DraftEntityInstance({type, mutability, data: data || {}})
    );
  },

  /**
   * Add an existing DraftEntityInstance to the DraftEntity map. This is
   * useful when restoring instances from the server.
   */
  add: function(instance: DraftEntityInstance): string {
    var key = '' + (++instanceKey);
    instances = instances.set(key, instance);
    return key;
  },

  /**
   * Retrieve the entity corresponding to the supplied key string.
   */
  get: function(key: string): DraftEntityInstance {
    var instance = instances.get(key);
    invariant(!!instance, 'Unknown DraftEntity key.');
    return instance;
  },

  /**
   * Entity instances are immutable. If you need to update the data for an
   * instance, this method will merge your data updates and return a new
   * instance.
   */
  mergeData: function(
    key: string,
    toMerge: {[key: string]: any}
  ): DraftEntityInstance {
    var instance = DraftEntity.get(key);
    var newData = {...instance.getData(), ...toMerge};
    var newInstance = instance.set('data', newData);
    instances = instances.set(key, newInstance);
    return newInstance;
  },

  /**
   * Completely replace the data for a given instance.
   */
  replaceData: function(
    key: string,
    newData: {[key: string]: any}
  ): DraftEntityInstance {
    const instance = DraftEntity.get(key);
    const newInstance = instance.set('data', newData);
    instances = instances.set(key, newInstance);
    return newInstance;
  },
};

module.exports = DraftEntity;
