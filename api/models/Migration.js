/**
 * Migration.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "migration",
  primaryKey: "id",

  attributes: {
    path: {
      type: "string",
    },
  },
};
