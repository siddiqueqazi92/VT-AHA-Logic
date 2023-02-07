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
      collectionList = await Artist_collection.find({
        where,
        select: ["id", "title", "image", "is_public","user_id"],
      })
        .skip(inputs.offset)
        .limit(inputs.limit)
        .sort("id DESC");

      if (!collectionList.length) {        
        return exits.ok({
          status: false,
          message: "Collections not found",    
          data:[]
        });
      }
      let artist = await User.findOne({ where: { user_id },select:['user_id','name','username','profile_image','cover_image'] });
      artist = {
        id: artist.user_id,
        profile_name:artist.name,
        profile_tag_id:artist.username,
        image:artist.profile_image,
        cover_image:artist.cover_image,
      }
      collection_ids = _.map(collectionList,"id")
      where = {user_id:inputs.user.id,artist_collection: collection_ids}
      let pinned_items = await User_pinned_art.getPinnedItemIds(where)//for pin privacy
      
      //getting pinned counts for artist_collections
			let pinned_art_collections_counts = await User_pinned_art.getPinnedCounts(collection_ids,"artist_collection_id");
      for (collection of collectionList) {
        collection.is_my_collection = collection.user_id == inputs.user.id
        collection.is_pinned = pinned_items.artist_collection_ids.includes(collection.id)

        collection.is_pin_privacy_public = false;
					if (collection.is_pinned == true) {
						//now checking pin privacy of the collection for logged in user
						collection.is_pin_privacy_public = _.find(pinned_items.pinned_arts, { artist_collection: collection.id })
						if (collection.is_pin_privacy_public) {
							collection.is_pin_privacy_public = collection.is_pin_privacy_public.is_public
						}
					}
        collection.pin_like_count = getPinCountArtistCollection(pinned_art_collections_counts, collection.id)
        collection.artist = artist
        delete collection.user_id

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
