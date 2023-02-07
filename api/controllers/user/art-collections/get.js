const { getPinCountArtistCollection } = require("../../../util");

module.exports = {
  friendlyName: "Get",

  description: "Get art collections",

  inputs: {
    user: {
      type: "ref",
    },
    artist_id:{
      type:'string',
      required:false
    },
    search_text: {
      type: "string",
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
      // try { sails.helpers.generateThumbnail('https://ahauserposts.s3.amazonaws.com/Snaptik_6904693098178219270_helen-ratner.mp4'); }catch(err){}
      let user_id = inputs.artist_id || inputs.user.id
      let where = {user_id}
      if(inputs.artist_id && inputs.artist_id != inputs.user.id){
        where.is_public = true
      }
      if (inputs.search_text) {
        where.title = {contains:inputs.search_text}
      }
      collectionList = await Artist_collection.getArtistCollections(
        where,
        inputs.user,
        inputs.offset,
        inputs.limit
        )

      if (!collectionList.length) {        
        return exits.ok({
          status: false,
          message: "Collections not found",    
          data:[]
        });
      }
      
      return exits.success({
        status: true,
        message: `${collectionList.length} Collections Listed Successfully`,
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
