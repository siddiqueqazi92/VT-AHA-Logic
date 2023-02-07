/**
 * Setting.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "settings",
  primaryKey: "id",

  attributes: {
    createdAt:false,
    updatedAt:false,
    key: {
      type: "string",
      required: false,
      allowNull:true
    },
    value: {
      type: "string",
      required: false,
      allowNull:true
    },

  },
  getValue: async function (key) { 
    let value = null
    try {
      let obj = await Setting.find({ key })
      if (obj.length) {
        value = obj[0].value
        switch (obj[0].key) {
          case 'bubble_api_cursor':
            value = parseInt(value)
            break;
        }
      }
    } catch (err) {
      sails.log.error(`Error in model Setting, function getValue. ${err}`)
    }
    return value
  }

};

