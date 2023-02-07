/**
 * Artist_address.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "artist_addresses",
  attributes: {
    createdAt: false,
    updatedAt: false,
    user_id: {
      type: "string",      
    },
    country: {
      type: "string",
      required: false,
      allowNull:true
    },
    state: {
      type: "string",
      required: false,
      allowNull:true
    },
    city: {
      type: "string",
      required: false,
      allowNull:true
    },
  },
};
