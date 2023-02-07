module.exports = {
  friendlyName: "Edit",

  description: "Edit art",

  inputs: {
    // user: {
    //   type: "ref",
    //   description: "Logged in user",
    // },
    id: {
      type: "number",
      required: true,
    },
    artist_id: {
      type: "string",
      required: true,
    },
    title: {
      type: "string",
      required: true,
    },
    price: {
      type: "number",
      required: false,
      allowNull:true,
    },
    max_quantity: {
      type: "number",
      required: false,
      allowNull:true,
    },
    description: {
      type: "string",
      required: false,
      allowNull:true,
    },
    sizes: {
      type: "ref",
    },
    vibe_ids: {
      type: "ref",
      required: true,
    },
    collection_ids: {
      type: "ref",
    },
    resources: {
      type: "ref",
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
    sails.log("action admin/arts/edit started");
    try {
      let obj = { ...inputs };
      obj.artist_id = inputs.artist_id;
      let sizes = inputs.sizes || [];
      let resources = inputs.resources;
      let vibes = inputs.vibe_ids || [];
      let collections = inputs.collection_ids || [];

      if(obj.sellable == false){
        delete obj.price
        delete obj.max_quantity        
      }
      delete obj.id
      delete obj.vibe_ids;
      delete obj.resources;
      delete obj.sizes;
      delete obj.collection_ids;
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
      if (sizes.length) {
         obj.price = null
      }
      let art = await Art.updateOne({id:inputs.id}).set(obj);
      if (art) {
        if (vibes.length) {
          await Art_vibe.destroy({art:art.id})
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
          await Art_resource.destroy({art:art.id})
          for (resource of resources) {
            delete resource.id
            delete resource.rawFile
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
        }
        if (sizes.length && obj.sellable == true) {          
          sizes = sizes.map((r) => {
            r.art = art.id;
            delete r.id
            return r;
          });
          await Art_size.destroy({art:art.id})
          let art_sizes = await Art_size.createEach(sizes).fetch();
        }
        if (collections.length) {
          await Art_collection.destroy({art:art.id})
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
