async function make_transactions(inputs) {
  await sails
    .getDatastore()
    .transaction(async (db) => {
      let obj = {
        cover_image: inputs.cover_image,
        is_artist: true,
        user_id: inputs.user.id,
      };
      await User.updateOrCreate({ user_id: inputs.user.id }, obj); //.usingConnection(db);
      let user = await User.findOne({ where: { user_id: inputs.user.id } ,select:["username","profile_image"]})
      let community_name = await sails.helpers.getCommunityName(
        inputs.user.id,
        user.username + "'s Community"
      );
      
      await Community.createOrUpdateCommunity(
        inputs.user.id,
        community_name,
        user.profile_image || null
      );
      // if (!updated) {
      //   throw new Error(
      //     "Consistency violation: Database is corrupted-- logged in user record has gone missing"
      //   );
      // }
      inputs.address.user_id = inputs.user.id;
      updated = await Artist_address.updateOrCreate(
        { user_id: inputs.user.id },
        inputs.address
      ); //.usingConnection(db);

      if (inputs.vibes) {
        await User_vibe.destroy({ user_id: inputs.user.id });
        for (vibe of inputs.vibes) {
          await User_vibe.create({ vibe: vibe, user_id: inputs.user.id });
        }
      }
      if (inputs.interests) {
        await User_interest.destroy({ user_id: inputs.user.id });
        for (interest of inputs.interests) {
          await User_interest.create({
            interest: interest,
            user_id: inputs.user.id,


            
          });
        }
      }
      // if (inputs.communities) {
      //   await Community_follower.destroy({ follower_id: inputs.user.id });
      //   for (community of inputs.communities) {
      //     await Community_follower.create({
      //       community: community,
      //       follower_id: inputs.user.id,
      //     });
      //   }
      // }
      Promise.resolve(true);

      // if (!updated) {
      //   throw new Error("There is no recipient with that id");
      // }
    })
    .intercept("E_INSUFFICIENT_FUNDS", () => "badRequest")
    .intercept("E_NO_SUCH_RECIPIENT", () => "notFound");
}
module.exports = {
  friendlyName: "Become artist",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    vibes: {
      type: "ref",
      required: true,
    },
    interests: {
      type: "ref",
      required: true,
    },
    // communities: {
    //   type: "ref",
    //   required: true,
    // },
    address: {
      type: "ref",
      required: true,
      custom: function (value) {
        return (
          _.isObject(value) &&
          !_.isUndefined(value.city) &&
          !_.isUndefined(value.state) &&
          !_.isUndefined(value.country)
        );
      },
    },
    cover_image: {
      type: "string",
      required: true,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/edit/become-artist started");

    try {
      let obj = { ...inputs };
      sails.log(obj);

      obj.user_id = obj.user.id;
      delete obj.user;

      let status = make_transactions(inputs);

      sails.log("action user/edit/become-artist ended");
      return exits.success({
        status: true,
        message: "Processed successfully",
      });
    } catch (err) {
      sails.log.error(`Error in action user/edit/become-artist. ${err}`);
      return exits.invalid(err.message || "Server error: can not process");
    }
  },
};
