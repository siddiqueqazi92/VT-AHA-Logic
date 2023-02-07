// async function abc() {
//   let users = await User.find({ user_id: { "!=": "62551ab0bd0c13049f2b3c14" } })
//   let rec = []
//   for (user of users) {
//     rec.push({
//       artist_id: '62551ab0bd0c13049f2b3c14',
//       follower_id:user.user_id
//     })
//   }
//   console.log(rec)
//  // await Artist_follower.createEach(rec).fetch();

const { getPinCountArtistCollection } = require("../../../../util");

// }
module.exports = {
  friendlyName: "Get Pinned Arts",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
  
    collection_id: {
      type: "number",
      required: false,
      allowNull:true
    },
    artist_id: {
      type: "string",
      required: false,
      allowNull:true
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
      description: "",
    },
    ok: {
      responseType: "ok",
      description: "",
    },
  },

  fn: async function (inputs, exits) {    
    sails.log("action user/arts/get-pinned started");
    try {     
      let user_id = inputs.artist_id || inputs.user.id
      let where = { user_id };
      where.collection = inputs.collection_id || null;
     
      //check if items are not of current user then only public items should be fetched
      if (user_id != inputs.user.id) {
      where.is_public = true
      }
      let pinned_items = await User_pinned_art.getPinnedItemIds(where,inputs.offset,inputs.limit)
      if (!pinned_items.art_ids.length && !pinned_items.artist_collection_ids.length) {
        return exits.ok({
          status: true,
          message: "Arts not found",    
          data:[]
        });
      }
      // let arts = await Art.getAll({ id: art_ids });
      let data = []
      data = await Art.getArtsWithCustomSorting(pinned_items.art_ids);
      if (pinned_items.artist_collection_ids.length) {
        let collections = await Artist_collection.get({ id: pinned_items.artist_collection_ids }, inputs.user)
        //now checking if artist collections is in logged in user's pinned list or not
        where = { user_id: inputs.user.id, artist_collection: _.map(collections, "id") }
        let user_pinned_items = await User_pinned_art.getPinnedItemIds(where, inputs.offset, inputs.limit)
        
        //getting pinned counts for artist_collections
				let pinned_art_collections_counts = await User_pinned_art.getPinnedCounts(_.map(collections,"id"),"artist_collection_id");
        for (collection of collections) {
          collection.is_my_collection = collection.user_id == inputs.user.id
          collection.is_pinned = user_pinned_items.artist_collection_ids.includes(collection.id)
          collection.artist = {
            id:collection.user_id
          }
          collection.pin_like_count = getPinCountArtistCollection(pinned_art_collections_counts,collection.id)
          delete collection.user_id
        }
        data = _.union(data, collections);
        data = _.sortBy(data, (o) => {        
         return pinned_items.all_ids.indexOf(o.id)
        });//sorting as pinned items order
      
      }      

      if (!data.length) {
        return exits.ok({
          status: true,
          message: "Arts not found",    
          data:[]
        });
      }
      
      sails.log("action user/arts/get-pinned ended");
      return exits.success({
        status: true,
        message: "Arts found successfully",    
        data:data
      });
    } catch (err) {
      sails.log.error(`Error in action user/arts/get-pinned. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not pin/unpin art"
      );
    }
  },
};
