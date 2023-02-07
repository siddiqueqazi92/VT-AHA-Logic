module.exports = {
  friendlyName: "Change pinned privacy",

  description: "",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    art_id: {
      type: "number",
      required: false,
      allowNull:true
    },
    artist_collection_id: {
      type: "number",
      required: false,
      allowNull:true
    },
    is_public: {
      type: "boolean",
      required: true,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("action user/arts/pinned/change-privacy started");
    try {      
      let obj = { ...inputs };
      delete obj.user;
      obj.user_id = inputs.user.id
     let where = { user_id: obj.user_id }
      if (inputs.art_id) {
        obj.art = obj.art_id; 
        where.art = obj.art_id
        delete obj.art_id
      }      
      if (inputs.artist_collection_id) {
        obj.artist_collection = obj.artist_collection_id; 
        where.artist_collection = obj.artist_collection_id; 
        delete obj.artist_collection_id
      }      
      
      let created = await User_pinned_art.updateOrCreate(where,obj)    
  
      // let data = await User_collection.findOne({where:{id:collection_id}})
      sails.log("action user/arts/pinned/change-privacy ended");
      return exits.success({
        status: true,
        message: "Processed successfully",  
        // data
      });
    } catch (err) {
      sails.log.error(`Error in action user/arts/pinned/change-privacy. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not change privacy of pinned item"
      );
    }
  },
};
