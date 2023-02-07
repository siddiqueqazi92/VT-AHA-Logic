module.exports = {
  friendlyName: "Pin unpin",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    artist_collection_id: {
      type: "number",
      required: true,
    },
    collection_id: {
      type: "number",
      required: false,
      allowNull:true
    },
    pin: {
      type: "boolean",
      required: true,
    },
    is_public: {
      type: "boolean",
      required: false,
    },
  },

  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/art-collections/pin-unpin started");
    try {     
      if (!await Artist_collection.isExists(inputs.artist_collection_id)) {
        return exits.ok({
          status: false,
          message: "Invalid Art Collection ID",            
        });
      }
      let obj = { ...inputs };
      delete obj.user;
      obj.user_id = inputs.user.id
      obj.artist_collection = obj.artist_collection_id;
      delete obj.artist_collection_id
      obj.collection = inputs.collection_id || null
      delete obj.collection_id
      delete obj.pin;
      let collection_id = obj.collection;
      let data = await User_collection.findOne({where:{id:collection_id}})
      if (inputs.pin == true) {
        // if (data) {
        //   obj.is_public = data.is_public
        // }
        // obj.is_public = !_.isUndefined(data) ?data.is_public:false
        let created = await User_pinned_art.updateOrCreate({ user_id: obj.user_id, artist_collection: obj.artist_collection,art:null }, { ...obj })
        if (obj.collection) {
          let ac = await Artist_collection.findOne({ where: { id: obj.artist_collection }, select: ['image'] });
          if (ac && ac.image) {
            await User_collection.updateOne({id:obj.collection}).set({image:ac.image})
          }
        }
      } else {
        let pinned = await User_pinned_art.find({ where: { artist_collection: obj.artist_collection, user_id: obj.user_id } }).limit(1);
        await User_pinned_art.destroy({ where: { artist_collection: obj.artist_collection, user_id: obj.user_id } });
        if (pinned.length && pinned[0].collection) {  
          collection_id = pinned[0].collection
          await User_collection.updateImage( pinned[0].collection)
        }
      }
      data = await User_collection.findOne({ where: { id: collection_id } })
      if (data) {
        data.is_my_collection = true
      }
      sails.log("action user/art-collections/pin-unpin ended");
      return exits.success({
        status: true,
        message: "Processed successfully",  
        data
      });
    } catch (err) {
      sails.log.error(`Error in action user/art-collections/pin-unpin. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not pin/unpin art"
      );
    }
  },
};
