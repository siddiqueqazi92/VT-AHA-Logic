/**
 * Interest.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "interests",
  primaryKey: "id",
  attributes: {
    title: {
      type: "string",
      required: true,
    },
    image: {
      type: "string",
      required: false,
      allowNull: true,
    },
  },
};
