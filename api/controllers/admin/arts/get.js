module.exports = {
  friendlyName: "Get arts",

  description: "Get all arts.",

  inputs: {
    // admin: {
    //   type: 'ref',
    //   required: true,
    //   description: 'logged in admin'
    // },

    query: {
      type: "ref",
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
    },
    unauthorized: {
      responseType: "unauthorized",
    },
    forbidden: {
      responseType: "forbidden",
    },
    serverError: {
      responseType: "serverError",
    },
    ok: {
      responseType: "ok",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "Running admin/arts/get.js with inputs " + JSON.stringify(inputs)
    );
    // return exits.ok({
    //   status: false,
    //   message: "",
    //   data: [],
    // });
    try {
      let query = null;
      if (inputs.query) {
        query = JSON.parse(inputs.query);
      } else {
        query = this.req.query;
      }

      sails.log({ reqQuery: JSON.stringify(query) });
      let range = [0, 9];
      if (query.range) {
        range = JSON.parse(query.range);
      }

      var sort = await sails.helpers.getSortFilters(query, true);

      let where = { deletedAt: null };
      if (query.filter) {
        var filter = JSON.parse(query.filter);

        if (filter.q) {
          filter.q = filter.q.toLowerCase();
          where.or = [{ title: { contains: filter.q } }];
          if (parseInt(filter.q)) {
            where.or.push({ id: parseInt(filter.q) });
          }
          let artist_ids = await User.getArtistsBySearchText(filter.q, "ids");          
          where.or.push({ artist_id: artist_ids });
        }
        if (filter.id) {
          where.id = filter.id;
        }
        if (!_.isUndefined(filter.community_id)) {
          let art_ids = await Community_art.getArtIds(filter.community_id)
          where.id = art_ids
        } else {
          where.type = global.ART_TYPE.DEFAULT
        }
        if (!_.isUndefined(filter.art_collection_id)) {
          let art_ids = await Art_collection.getMultipleCollectionsArtIds([filter.art_collection_id])
          where.id = art_ids
        }
        if (!_.isUndefined(filter.artist_id)) { 
          where.artist_id = filter.artist_id
        }
      }

      // let order = sort[0];
      // order = Object.keys(order).map((key) => [key, order[key]])[0];
      // sails.log({ oder: order });

      sails.log({ sortaaaaa: sort });    
      let arts = await Art.getAll(where, range[0], range[1] - range[0] + 1,sort, [
        "id",
        "artist_id",
        "title",
        "price",
        "max_quantity",
        "sellable",
        "shippable",
        "createdAt",
      ]);
      if (arts.length) {
        arts[0].total = await Art.count({ where: where });            
        
        return exits.success({
          status: true,
          message: `${arts.length} records found`,
          data: arts,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/arts/get.js", err.message);
      if (
        !_.isUndefined(err.response) &&
        !_.isUndefined(err.response.data) &&
        !_.isUndefined(err.response.status)
      ) {
        let [exitsName, responseData] = await sails.helpers.response.with({
          status: err.response.status,
          data: err.response.data,
        });
        return exits[exitsName](responseData);
      }
      return exits.serverError({
        status: false,
        data: [],
        message: "Unknown server error.",
      });
    }
  },
};
