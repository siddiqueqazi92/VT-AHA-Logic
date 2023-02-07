/**
 * Country.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "countries",
  primaryKey: "id",
  attributes: {
    country_code: {
      type: "string",
      required: true,
    },
    alpha3: {
      type: "string",
      required: true,
    },
    en: {
      type: "string",
      required: true,
    },
    ar: {
      type: "string",
      required: true,
    },
    currency_code: {
      type: "string",
      required: true,
    },
    dial_code: {
      type: "string",
      required: true,
    },
    flag: {
      type: "string",
      required: true,
    },
  },
};
