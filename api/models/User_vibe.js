/**
 * User_vibe.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "user_vibes",
  primaryKey: "id",
  attributes: {
    createdAt: false,
    updatedAt: false,
    user_id: {
      type: "string",
      required: true,
      columnName: "user_id",
    },
    vibe: {
      model: "vibe",
      required: true,
      columnName: "vibe_id",
    },
  },
  getUserVibeIds: async function (user_id) {
    let data = []
    try {
      let user_vibes = await User_vibe.find({
        where: { user_id },
        select: ["vibe"],
      });
      if (user_vibes.length) {
        user_vibes = _.map(user_vibes, "vibe");
        data = user_vibes;
      }
    } catch (err) {
      sails.log.error(`Error in model User_vibe, function getUserVibeIds. ${err}`)
    }
    return data
  }
};
