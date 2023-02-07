/**
 * Art_resource.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "art_collections",
  attributes: {
    createdAt: false,
    updatedAt: false,
    art: {
      model: "art",
      required: true,
      columnName: "art_id",
    },
    collection: {
      model: "artist_collection",
      required: true,
      columnName: "collection_id",
    },
  },
  getMultipleCollectionsArtIds: async function (collection_ids) {
    let ids = []
    try {
      let ca = await Art_collection.find({ collection: collection_ids })
      ids = ca.length > 0 ? _.map(ca, "art"):[];
    } catch (err) {
      sails.log.error(`Error in model Art_collection, function getSingleCollectionArtIds. ${err}`);
    }
    return ids;
  },
  countArtInCollection: async function (collection_id) {
    let count = 0
    try {
      count = await Art_collection.count({ collection: collection_id })     
    } catch (err) {
      sails.log.error(`Error in model Art_collection, function countArtInCollection. ${err}`);
    }
    return count;
  },
};
