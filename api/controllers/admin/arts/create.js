const { updateVideoThumbnails } = require("../../../util");

module.exports = {
  friendlyName: "Create",

  description: "Create art",

  inputs: {
    // user: {
    //   type: "ref",
    //   description: "Logged in user",
    // },
    artist_id: {
      type: "string",
      required: false,
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
    resources: {
      type: "ref",
    },
    post_in_community: {
      type: "boolean",
    },
    sellable: {
      type: "boolean",
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
    sails.log("action admin/arts/create started");
    try {
      let obj = { ...inputs };
      obj.artist_id = inputs.artist_id;
      let sizes = inputs.sizes || [];
      let resources = inputs.resources;
      let vibes = inputs.vibes || [];
      let collections = inputs.collections || [];

      if(obj.sellable == false){
        delete obj.price
        delete obj.max_quantity        
      }
      delete obj.vibes;
      delete obj.resources;
      delete obj.sizes;
      delete obj.collections;
      delete obj.post_in_community
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
          user_id: inputs.artist_id,
        });
        if (collection_count !== collections.length) {
          return exits.ok({
            status: false,
            message: "Some collection ids are invalid",
          });
        }
      }
      if (inputs.post_in_community) {
        let aha_artist = await User.getAhaArtist();
        obj.type = global.ART_TYPE.DROP    
        obj.artist_id = aha_artist.user_id
      }
      if (sizes.length) {
        delete obj.price
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
          // resources = resources.map((r) => {
          //   r.art = art.id;
          //   return r;
          // });
          for (resource of resources) {
            resource.art = art.id;
            is_valid_url = await sails.helpers.isValidUrl(resource.uri);
            if (is_valid_url === false) {
              resource.uri = await sails.helpers.aws.uploadFile(
                resource.uri,
                "arts"
              );
            }
          }
          let art_resources = await Art_resource.createEach(resources).fetch();
          updateVideoThumbnails(art_resources);
          await sails.helpers.saveThumbnail(art.id, resources);
        }
        if (sizes.length && obj.sellable == true) {
          sizes = sizes.map((r) => {
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
        if (inputs.post_in_community) {
          await Community.addArtInAhaCommunity(art.id);
        }
      }

      sails.log("action admin/arts/create ended");
      return exits.success({
        status: true,
        message: "Art created successfully",
        data: art,
      });
    } catch (err) {
      sails.log.error(`Error in action admin/arts/create. ${err}`);
      return exits.invalid(err.message || "Server error: can not create art");
    }
  },
};
