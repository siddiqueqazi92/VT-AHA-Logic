/**
 * Artist_collection.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { getPinCountArtistCollection } = require("../util");

module.exports = {
  tableName: "artist_collections",
  attributes: {
    // createdAt: false,
    // updatedAt: false,
    user_id: {
      type: "string",
      required: true,
    },
    title: {
      type: "string",
      required: true,
    },
    image: {
      type: "string",
      required: true,
    },
    is_public: {
      type: "boolean",
      required: true,
    },
    art_collections: {
			collection: "art_collection",
			via: "collection",
    },
    vibes: {
			collection: "Artist_collection_vibe",
			via: "collection",
		},
  },
  getCollectionArtIds: async function (user_id = null, get = "all") {
    let ids = []
    try {
      let where = { id: { "!=": null } };
      if (user_id) {
        where.user_id = user_id
      }
      switch (get) {
        case 'private':
          where.is_public = false;
          break;
        case 'public':
          where.is_public = true;
          break;
      }
      let collections = await Artist_collection.find(where).populate('art_collections');
      if (collections.length) {
        let art_collections = _.map(collections, "art_collections")        
        if (art_collections.length) {
          art_collections = _.zipWith(...art_collections, _.concat);
          ids = _.map(art_collections[0], "art");
        }
        
      }
    } catch (err) {
      sails.log.error(`Error in model Artist_collection, function getCollectionArtIds. ${err}`);
    }
    return ids;
  },

  deleteOne: async function (id) {
    let deleted = false;
   try {
   deleted = await sails
    .getDatastore()
      .transaction(async (db) => {
        await Art_collection.destroy({ collection: id });  
        await Artist_collection_vibe.destroy({ collection: id });  
        await Artist_collection.destroyOne({ id });         
        return true
    })
   } catch (err) {
     sails.log.error(`Error in Model Artist_collection, Function deleteOne. ${err}`)
   }
    return deleted;  
    
  },
  isExists: async function (id) {
    let exists = true;
   try {
     exists = await Artist_collection.count({ id });
     exists = exists > 0?true:false
   } catch (err) {
     sails.log.error(`Error in Model Artist_collection, Function isExists. ${err}`)
   }
    return exists;  
  },
  get: async function (where,user,offset = 0 ,limit = 1000) {
    let collections = [];
   try {
    collections = await Artist_collection.find({
      where,
      select: ["id", "title", "image", "is_public","user_id","createdAt","user_id"],
    })
      .skip(offset)
      .limit(limit)
      .sort("id DESC");
     if (collections.length) {
       for (c of collections) {
         c.is_collection = true
         c.is_my_collection = user.id == c.user_id
       }
     }
   } catch (err) {
     sails.log.error(`Error in Model Artist_collection, Function get. ${err}`)
   }
    return collections;  
  },
  getOne: async function (where,user,select = []) {
    let collection = {};
   try {
    collection = await Artist_collection.findOne({
      where,
      select: ["id", "title", "image", "is_public","user_id","createdAt","user_id"],
    })     
     if (collection) {             
       collection.is_collection = collection.user_id == user.id 
       collection.is_my_collection = user.id == collection.user_id    
       
       let pinned = await User_pinned_art.find({ where: { artist_collection: collection.id,art:null, user_id: user.id } })
       collection.is_pinned = !_.isUndefined(pinned[0]) ? true : false;
       collection.is_pin_privacy_public = !_.isUndefined(pinned[0]) ? pinned[0].is_public : false;
       collection.pin_like_count = await User_pinned_art.count({ where: { artist_collection: collection.id } })
       
       }
     
   } catch (err) {
     sails.log.error(`Error in Model Artist_collection, Function getOne. ${err}`)
   }
    return collection;  
  },
  getArtistCollections: async function (where,user,offset = 0, limit = 1000,select = []) {
    let collections = [];
   try {
    collections = await Artist_collection.find({
      where,
      select: ["id", "title", "image", "is_public","user_id"],
    })
      .skip(offset)
      .limit(limit)
      .sort("id DESC");

    if (!collections.length) {        
      return collections
    }
    let artists = await User.find({ where: { user_id:_.map(collections,"user_id") },select:['user_id','name','username','profile_image','cover_image'] });
   
    collection_ids = _.map(collections,"id")
    where = {user_id:user.id,artist_collection: collection_ids}
    let pinned_items = await User_pinned_art.getPinnedItemIds(where)//for pin privacy
    
    //getting pinned counts for artist_collections
    let pinned_art_collections_counts = await User_pinned_art.getPinnedCounts(collection_ids,"artist_collection_id");
     for (collection of collections) {
       let artist = _.find(artists,{user_id:collection.user_id})
      collection.artist = {
        id: artist.user_id,
        profile_name:artist.name,
        profile_tag_id:artist.username,
        image:artist.profile_image,
        cover_image:artist.cover_image,
      }
      collection.is_my_collection = collection.user_id == user.id
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
      delete collection.user_id

    }
     
   } catch (err) {
     sails.log.error(`Error in Model Artist_collection, Function getArtistCollections. ${err}`)
   }
    return collections;  
  },
  getArtistCollectionsIdsByArtist: async function (search_text) {
    let data = [];
   try {
     let query = `
     select ac.id
     from artist_collections ac
     inner join users u
     on u.user_id = ac.user_id
     where u.username like '%${search_text}%'     
     `
     
			let result = await sails.sendNativeQuery(query)
			if (result.rows.length) {
				data = _.map(result.rows,"id")
			}
     
   } catch (err) {
     sails.log.error(`Error in Model Artist_collection, Function getArtistCollectionsIdsByArtist. ${err}`)
   }
    return data;  
  },
  countArtistCollections: async function (user_id) {		
		let data	 = 0;

		try {
			data = await Artist_collection.count({
				user_id,			
			})			
		} catch (err) {
			sails.log.error(`Error in model Artist_collection, function countArtistCollections. ${err}`);
		}
		return data;
	},
};

