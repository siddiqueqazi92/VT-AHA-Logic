const { updateVideoThumbnails } = require("../../../util");

module.exports = {
  friendlyName: "Create",

  description: "Create art",

  inputs: {
    user: {
      type: "ref",
      description: "Logged in user",
    },
    title: {
      type: "string",
      required: true,
    },
    price: {
      type: "number",
      required: false,
      // min:0.5
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
      // custom: function (value) {
      //   for (obj of value) {
      //     return (
      //       _.isObject(obj) &&
      //       !_.isUndefined(obj.price) &&
      //       obj.price >= 0.5
      //     );
      //  }
      // },
    },
    vibes: {
      type: "ref",
      required: true,
    },
    collections: {
      type: "ref",
    },
    resources: {
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
    sails.log("action user/arts/create started");
    sails.log('inputs in  action user/arts/create:',inputs)
    try {
      let obj = { ...inputs };
      obj.artist_id = inputs.user.id;
      let sizes = inputs.sizes || [];
      let resources = inputs.resources || []
      let vibes = inputs.vibes || [];
      let collections = inputs.collections || [];
      delete obj.vibes;
      delete obj.resources;
      delete obj.sizes;
      delete obj.collections;

      if (vibes.length) {
        let vibe_count = await Vibe.count({ id: vibes });
        if (vibe_count !== vibes.length) {
          return exits.ok({
            status: false,
            message: "Some vibe ids are invalid",
          });
        }
      }
      if (obj.price && obj.price < 0.5) {
        return exits.ok({
          status: false,
          message: "Price must be greater than or equal to 0.5",
        });
      }
      let artist_address = await User_address.find({ user_id: inputs.user.id, is_selected: true })
      artist_address = artist_address.length > 0 ? artist_address[0]:null
      
      if (sizes.length) {
        for (s of sizes) {
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
      if (obj.shippable === true && obj.template && !_.isEmpty(obj.template)) {
        obj.template = JSON.stringify(obj.template)
        let is_valid_address = await sails.helpers.shippo.addresses.isValid(artist_address.title, artist_address.country, artist_address.state, artist_address.city, artist_address.zip, artist_address.street)
        if (is_valid_address.is_valid === false) {
          return exits.ok({
            status: false,
            message: is_valid_address.message,          
          });
        }
      } else if (obj.shippable === false) {
        obj.template = null        
      }
      let art = await Art.create(obj).fetch();
      if (art) {
        if (vibes.length) {
          vibes = vibes.map((v) => {
            return {
              art: art.id,
              vibe: v,
            };
          });
          let art_vibes = await Art_vibe.createEach(vibes).fetch();
        }
        if (resources.length) {
          resources = resources.map((r) => {
            if (r.type.includes('video') && art.type == global.ART_TYPE.DEFAULT) {
             // r.thumbnail = global.DEFAULT_THUMBNAIL
            }
            r.art = art.id;
            return r;
          });
          let art_resources = await Art_resource.createEach(resources).fetch();
          updateVideoThumbnails(art_resources);
          await sails.helpers.saveThumbnail(art.id, resources);
          
        }
        if (sizes.length) {
          sizes = sizes.map((r) => {
            if (r.template) {
              r.template = JSON.stringify(r.template)
            }
            r.art = art.id;
            return r;
          });
          let art_sizes = await Art_size.createEach(sizes).fetch();
        }
        if (collections.length) {
          collections = collections.map((c) => {
            return {
              art: art.id,
              collection: c,
            };
          });
          let art_collection = await Art_collection.createEach(
            collections
          ).fetch();
        }

        if (inputs.type == global.ART_TYPE.DROP) {
          //attach this art with artist's community
          let community = await Community.getArtistCommunity(inputs.user)
          if (community) {
            await Community_art.createOrUpdateCommunityArt(community.id, art.id);
          }
        }
      }
      let user = inputs.user
      user.user_id = user.id
      let arts = await Art.getArts(
        inputs.user,
        {id:art.id},
        0,
        1
      );
      
      if (arts[0].template && !_.isObject(arts[0].template)) {
        arts[0].template = JSON.parse(arts[0].template)
      }
      sails.log("action user/arts/create ended");
      return exits.success({
        status: true,
        message: "Art created successfully",
        data:arts[0]
      });
    } catch (err) {
      sails.log.error(`Error in action user/arts/create. ${err}`);
      return exits.invalid(err.message || "Server error: can not create art");
    }
  },
};
