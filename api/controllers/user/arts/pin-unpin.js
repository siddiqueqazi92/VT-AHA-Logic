module.exports = {
  friendlyName: "Pin unpin",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    art_id: {
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
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/arts/pin-unpin started");
    try {      
      let obj = { ...inputs };
      delete obj.user;
      obj.user_id = inputs.user.id
      obj.art = obj.art_id;
      delete obj.art_id
      obj.collection = inputs.collection_id || null
      delete obj.collection_id
      delete obj.pin;
      let collection_id = obj.collection;
      let data = await User_collection.findOne({where:{id:collection_id}})
      if (inputs.pin == true) {
        await sails.helpers.notifications.sendAndSave(sails.config.notification.type.art_was_pinned,{art_id:inputs.art_id,user:inputs.user});
        // if (data) {
        //   obj.is_public = data.is_public
        // }
        let created = await User_pinned_art.updateOrCreate({ user_id: obj.user_id, art: obj.art,artist_collection:null }, { ...obj })
        if (obj.collection) {
          let art = await Art.findOne({ where: { id: obj.art }, select: ['thumbnail'] });
          if (art && art.thumbnail) {
            await User_collection.updateOne({id:obj.collection}).set({image:art.thumbnail})
          }
        }
      } else {
        let pinned_art = await User_pinned_art.find({ where: { art: obj.art, user_id: obj.user_id } }).limit(1);
        await User_pinned_art.destroy({ where: { art: obj.art, user_id: obj.user_id } });
        if (pinned_art.length && pinned_art[0].collection) {
          collection_id = pinned_art[0].collection
          await User_collection.updateImage( pinned_art[0].collection)
        }
      }
      data = await User_collection.findOne({ where: { id: collection_id } })
      if (data) {
        data.is_my_collection = true
      }
      sails.log("action user/arts/pin-unpin ended");
      return exits.success({
        status: true,
        message: "Processed successfully",  
        data
      });
    } catch (err) {
      sails.log.error(`Error in action user/arts/pin-unpin. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not pin/unpin art"
      );
    }
  },
};
