/**
 * order_address.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "order_addresses",
  attributes: {
    createdAt: false,
    updatedAt: false,
    order: {
      model: "order",      
      columnName:"order_id"
    },    
    title: {
      type: "string",
      required: true,
    },
    country: {
      type: "string",
      required: true,
    },
    state: {
      type: "string",
      required: true,
    },
    city: {
      type: "string",
      required: true,
    },   
    street: {
      type: "string",
      required: true,
    },
    zip: {
      type: "string",
      required: true,
    },  
  },
};
