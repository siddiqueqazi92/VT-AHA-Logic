module.exports = {
  friendlyName: "Get one",

  description: "Get one community of artist",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    id: {
      type: "number",
      required:true
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
      "action user/communities/get-one started with inputs " + JSON.stringify(inputs)
    );
    try {
     let community = await Community.findOne({id:inputs.id})
      if (!community) {
        return exits.ok({
          status: false,
          message: "Community not found",          
        });
      }      
      sails.log("action user/communities/get-one ended");
      return exits.success({
        status: true,
        message: `Community found successfully`,
        data: community,
      });
    } catch (err) {
      sails.log.error(`Error in action user/communities/get-one. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not get user communities"
      );
    }
  },
};
