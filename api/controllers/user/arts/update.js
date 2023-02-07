module.exports = {
  friendlyName: "update",

  description: "Update art",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    id: {
      type: "number",
      required: true,
    },
    title: {
      type: "string",
      required: true,
    },
    price: {
      type: "number",
      required: false,
    },
    max_quantity: {
      type: "number",
      required: false,
    },
    description: {
      type: "string",
      required: false,
    },
    type: {
      type: "string",
      required: false,
      defaultsTo:'default'
    },
    sizes: {
      type: "ref",
    },
    vibes: {
      type: "ref",
      required: true,
    },
    collections: {
      type: "ref",
    },   
    sellable: {
      type: "boolean",
    },
    supportable: {
			type: "boolean",
    },
    shippable: {
			type: "boolean",
    },
    template: {
			type: "ref",			
		},
		weight: {
			type: "number",
		},
		mass_unit: {
			type: "string",
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
    sails.log("action user/arts/update started");
    try {
      let exist = await Art.count({ artist_id: inputs.user.id, id: inputs.id })
      if (!exist) {
        return exits.ok({
          status: false,
          message: "Invalid ID",
        });
      }
     
      let obj = { ...inputs };
      obj.artist_id = inputs.user.id;        
      let vibes = inputs.vibes || [];
      let collections = inputs.collections || [];
      

      let artist_address = await User_address.find({ user_id: inputs.user.id, is_selected: true })
      artist_address = artist_address.length > 0 ? artist_address[0]:null
      if (obj.shippable === true && obj.template && !_.isEmpty(obj.template)) {   
        let is_valid_address = await sails.helpers.shippo.addresses.isValid(artist_address.title, artist_address.country, artist_address.state, artist_address.city, artist_address.zip, artist_address.street)
        if (is_valid_address.is_valid === false) {
          return exits.ok({
            status: false,
            message: is_valid_address.message,          
          });
        }
      }else if (obj.shippable === false) {
        obj.template = null        
      }
      if (!_.isUndefined(obj.sizes)) {
        for (s of obj.sizes) {
          if (
            _.isUndefined(s.price) ||
            s.price < 0.5
          ) {
            return exits.ok({
              status: false,
              message: "Price must be greater than or equal to 0.5",
            });
          }
          if (obj.shippable === true && s.template && !_.isEmpty(s.template)) {          
            let is_valid_address = await sails.helpers.shippo.addresses.isValid(artist_address.title, artist_address.country, artist_address.state, artist_address.city, artist_address.zip, artist_address.street)
            if (is_valid_address.is_valid === false) {
              return exits.ok({
                status: false,
                message: is_valid_address.message,          
              });
            }
          }else if (obj.shippable === false) {
            s.template = null        
          }
          
        }
      }
      
      if (vibes.length) {
        let vibe_count = await Vibe.count({ id: vibes });
        if (vibe_count !== vibes.length) {
          return exits.ok({
            status: false,
            message: "Some vibe ids are invalid",
          });
        }
      }
      if (collections.length) {
        let collection_count = await Artist_collection.count({
          id: collections,
          user_id: inputs.user.id,
        });
        if (collection_count !== collections.length) {
          return exits.ok({
            status: false,
            message: "Some collection ids are invalid",
          });
        }
      }
      let updated = await Art.updateArt(obj,inputs.user)
      if (!updated) {
        return exits.ok({
          status: false,
          message: "Unable to update",
        });
      }
      let user = inputs.user
      user.user_id = user.id
      let arts = await Art.getArts(
        inputs.user,
        {id:obj.id},
        0,
        1
      );
      if (arts[0].template && !_.isObject(arts[0].template)) {
        arts[0].template = JSON.parse(arts[0].template)
      }

      sails.log("action user/arts/update ended");
      return exits.success({
        status: true,
        message: "Art updated successfully",
        data:arts[0]
      });
    } catch (err) {
      sails.log.error(`Error in action user/arts/update. ${err}`);
      return exits.invalid(err.message || "Server error: can not update art");
    }
  },
};
