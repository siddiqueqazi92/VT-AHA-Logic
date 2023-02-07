module.exports = {
  friendlyName: "Update bubble user",

  description: "Update bubble user",

  inputs: {
    user_id: {
      type: "string",
    },
    email: {
      type: "string",
      description:"Bubble user email to idenity user in AHA. It will not be updated"
    },
    username: {
      type: "string",
    },
    name: {
      type: "string",
    },
    city: {
      type: "string",
    },
    bio: {
      type: "string",
    },
    instagram: {
      type: "string",
    },
    twitter: {
      type: "string",
    },
    website: {
      type: "string",
    },
    profile_image: {
      type: "string",      
    },
    cover_image: {
      type: "string",      
    },
    user_type: {
      type: "string",     
      defaultsTo:"artist"
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
      description: "",
    },
    ok: {
      responseType: "ok",
    },
  },

  fn: async function (inputs, exits) {
    sails.log(`action bubble/update-user started. Inputs: ${JSON.stringify(inputs)}`);
    
    try {
      let user_id = inputs.user_id 
      
         
      let obj = {}
      obj.user_id = user_id;     
      obj.is_artist = inputs.user_type.toLowerCase() == 'artist'
                
    if (inputs.profile_image) {
      obj.profile_image = 'https:'+inputs.profile_image
    }
    if (inputs.cover_image) {
      obj.cover_image = 'https:'+inputs.cover_image
    }
      if (inputs.username) {
        obj.username = inputs.username
      }
      if (inputs.name) {
        obj.name = inputs.name
      }
      if (inputs.instagram) {
        obj.instagram = inputs.instagram
      }
     
      
      await User.updateOrCreate({ user_id }, obj);
      if (inputs.city) {
         updated = await Artist_address.updateOrCreate(
        { user_id },
        {user_id,city:inputs.city}
      ); 
      }
     
      let user = await User.getProfile(user_id)
      sails.log("action bubble/update-user ended");
      return exits.success({
        status: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (err) {
      sails.log.error(`Error in action bubble/update-user. ${err}`);
      return exits.invalid(
        err.message || "Server error: can not update user"
      );
    }
  },
};
