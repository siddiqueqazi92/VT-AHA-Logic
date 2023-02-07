/**
 * user_notification.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

 module.exports = {
  datastore: "default",
  tableName: "user_notifications",
  primaryKey: "id",

  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
    },
    user_id: {
      type: "string",
      required: true,
    },   
    title: {
      type: "string",
      required: false,
      allowNull: true,
    },
    body: {
      type: "string",
      required: false,
      allowNull: true,
    },
    extra_data: {
      type: "string",
      columnType: "text",
      required: true,
    },
    notification_type: {
      type: "string",
      required: false,
    },
    is_read: {
      type: "boolean",
      required: false,
      defaultsTo: false,
    },  
  },
};
