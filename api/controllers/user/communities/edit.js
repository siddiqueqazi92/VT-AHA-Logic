module.exports = {
  friendlyName: "Edit artist community",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    id: {
      type: "number",
      required:true
    },
    name: {
      type: "string",
    },
    image: {
      type: "string",
    },   
    facebook: {
			type: "string",
			required: false,
      allowNull:true
		},
		instagram: {
			type: "string",
			required: false,
      allowNull:true
		},
		tiktok: {
			type: "string",
			required: false,
      allowNull:true
		},
		dribble: {
			type: "string",
			required: false,
      allowNull:true
		},
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
    ok: {
      responseType: "ok",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "action user/communities/edit started with inputs " + JSON.stringify(inputs)
    );
    try {
     let community = await Community.findOne({id:inputs.id, artist_id:inputs.user.id})
      if (!community) {
        return exits.ok({
          status: false,
          message: "Community not found",          
        });
      }
      let obj = { ...inputs }
      delete obj.user
     community = await Community.updateOne({id:community.id}).set(obj)
      sails.log("action user/communities/edit ended");
      return exits.success({
        status: true,
        message: `Community updated successfully`,
        data: community,
      });
    } catch (err) {
      sails.log.error(`Error in action user/communities/edit. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user communities"
      );
    }
  },
};
