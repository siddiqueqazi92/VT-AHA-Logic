/**
 * Screen_content.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "screen_contents",
  attributes: {
    key: {
      type: "string",
      required: true,
    },
    en: {
      type: "string",
      required: true,
    },
  },
};
