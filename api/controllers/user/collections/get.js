
module.exports = {
  friendlyName: "Get",

  description: "Get collections",

  inputs: {
    user: {
      type: "ref",
    },    
    artist_id: {
      type:'string'
    },
    offset: {
      type: "number",
      defaultsTo: 0,
    },
    limit: {
      type: "number",
      defaultsTo: 1000,
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
      "Running user/collections/get.js with inputs " + JSON.stringify(inputs)
    );
   
    try {      
      let user_id =  inputs.artist_id || inputs.user.id
      let where = {user_id}
    
      //check if items are not of current user then only public items should be fetched
      if (user_id != inputs.user.id) {
        where.is_public = true
        }
      collectionList = await User_collection.find({
        where,
        select: ["id", "title", "image","user_id","is_public"],
      })
        .skip(inputs.offset)
        .limit(inputs.limit)
        .sort("id DESC");

      if (!collectionList.length) {        
        return exits.ok({
          status: false,
          message: "Collections not found",          
        });
      }
      for (c of collectionList) {
        c.is_my_collection = c.user_id == inputs.user.id
      }
      return exits.success({
        status: true,
        message: "Collections Listed Successfully",
        data: collectionList,
      });
    } catch (err) {
      sails.log.error("error calling user/collections/get.js", err.message);
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
