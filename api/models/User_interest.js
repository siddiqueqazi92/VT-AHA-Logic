/**
 * User_interest.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "user_interests",
  primaryKey: "id",
  attributes: {
    createdAt: false,
    updatedAt: false,
    user_id: {
      type: "string",
      required: true,
      columnName: "user_id",
    },
    interest: {
      model: "interest",
      required: true,
      columnName: "interest_id",
    },
  },
  getUserInterestIds: async function (user_id) {
    let data = []
    try {
      let user_interests = await User_interest.find({
        where: { user_id },
        select: ["interest"],
      });
      if (user_interests.length) {
        user_interests = _.map(user_interests, "interest");
        data = user_interests;
      }
    } catch (err) {
      sails.log.error(`Error in model User_interest, function getUserinterestIds. ${err}`)
    }
    return data
  }
};
