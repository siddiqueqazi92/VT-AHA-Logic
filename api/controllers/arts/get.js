module.exports = {
  friendlyName: "Get",

  description: "Get arts",

  inputs: {
    user: {
      type: "ref",
    },
    artist_id:{
      type:'string',
      required:false
    },
    collection_id:{
      type:'string',
      required:false
    },
    sellable: {
      type: 'string',
      required:false
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
      "Running arts/get.js with inputs " + JSON.stringify(inputs)
    );

    try {
      let artist_id = inputs.artist_id || inputs.user.id
      let where = { deletedAt: null, artist_id, type: global.ART_TYPE.DEFAULT }
      if (!_.isUndefined(inputs.sellable)) {
        where.sellable =  inputs.sellable.toLowerCase() == 'true'
      }
      if(inputs.collection_id){
        let collections = await Art_collection.find({ collection: inputs.collection_id }).populate('art')     
        if (!collections.length) {
          
        return exits.ok({
          status: true,
          message: "Arts not found", 
          data:[]       
        });
        }
        let arts_to_fetch = _.map(collections, "art")
        where.id = _.map(arts_to_fetch,"id")
        
      } else if(artist_id != inputs.user.id){
        let exclude_ids = await Artist_collection.getCollectionArtIds(artist_id, get = "private");
        if (exclude_ids.length) {
          where.id = { "!=": exclude_ids };
        }
      }
      artList = await Art.find({
        where,
        select: ["id", "title","artist_id","thumbnail"],
      })
        .skip(inputs.offset)
        .limit(inputs.limit)
        .sort("id DESC");
      
      let resources = await Art_resource.find({ where: { art: _.map(artList, "id"), type: { contains: 'image' } } })
      for (art of artList) {
        art.is_my_post = art.artist_id == inputs.user.id
        let resource = _.find(resources, { art: art.id })
        if (resource) {
         // art.thumbnail = resource.uri
        } else {
          //art.thumbnail = ''
        }
      }

      return exits.ok({
        status: true,
        message: "Arts Listed Successfully",
        data: artList,
      });
    } catch (err) {
      sails.log.error("error calling arts/get.js", err.message);
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
