module.exports = {
  friendlyName: "Delete Follower",

  description: "Delete Follower",

  inputs: {
    user: {
      type: "ref",
    },
    follower_id: {
      type: "string",
      required: true,
    },
    
  },

  exits: {
    invalid: {
      responseType: "badRequest",
    },
    unauthorized: {
      responseType: "unauthorized",
    },
    forbidden: {
      responseType: "forbidden",
    },
    serverError: {
      responseType: "serverError",
    },
    ok: {
      responseType: "ok",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "Running user/followerd/delete.js with inputs " + JSON.stringify(inputs)
    );
    try {
      let where = {
        artist_id: inputs.user.id,
        follower_id: inputs.follower_id,
      };
     let follower = await Artist_follower.findOne(where);
      if (!follower) {
        return exits.ok({
          status: false,
          message: "Invalid follower ID",
        });
      }
      
    
      await Artist_follower.destroy(where);
    
      return exits.success({
        status: true,
        message: "Follower removed Successfully",
      });
    } catch (err) {
      sails.log.error("error calling user/followers/delete.js", err.message);
      if (
        !_.isUndefined(err.response) &&
        !_.isUndefined(err.response.data) &&
        !_.isUndefined(err.response.status)
      ) {
        let [exitsName, responseData] = await sails.helpers.response.with({
          status: err.response.status,
          data: err.response.data,
        });
        return exits[exitsName](responseData);
      }
      return exits.serverError({
        status: false,
        data: [],
        message: "Unknown server error.",
      });
    }
  },
};
