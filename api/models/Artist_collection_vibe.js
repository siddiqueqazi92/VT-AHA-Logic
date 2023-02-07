/**
 * Artist_collection_vibe.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "artist_collection_vibes",
  attributes: {
    createdAt: false,
    updatedAt: false,
    collection: {
      model: "artist_collection",
      columnName: "collection_id",
    },
    vibe: {
      model: "vibe",
      columnName: "vibe_id",
    },
  },
};
