/**
 * Art_resource.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "art_resources",
  attributes: {
    createdAt: false,
    updatedAt: false,
    art: {
      model: "art",
      required: true,
      columnName: "art_id",
    },
    type: {
      type: "string",
      required: true,
    },
    uri: {
      type: "string",
      required: true,
    },
    thumbnail: {
      type: "string",
      required: false,
      allowNull: true,
    },
  },
  // beforeCreate: async function (record, cb) {
  //   sails.log.debug("calling beforeCreate Art_resource");
  //     try {
  //       if (record.type.includes("video") && !record.thumbnail) {
  //         record.thumbnail = 'https://ahauserposts.s3.amazonaws.com/video-files.png'
  //       }
  //       return cb();
  //     } catch (e) {
  //       sails.log.error("error creating thumbnail", e);
  //       throw new Error("Error: Cannot create thumbnail.");
  //     }
    
  //   return cb();
  // },
  // beforeUpdate: async function (record, cb) {
  //   sails.log.debug("calling beforeUpdate Art_resource");
  //     try {
  //       if (record.type.includes("video") && !record.thumbnail) {
  //         record.thumbnail = 'https://ahauserposts.s3.amazonaws.com/video-files.png'
  //       }
  //       return cb();
  //     } catch (e) {
  //       sails.log.error("error updating thumbnail", e);
  //       throw new Error("Error: Cannot update thumbnail.");
  //     }
    
  //   return cb();
  // },
};
// https://ahauserposts.s3.amazonaws.com/video-files.png