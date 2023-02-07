

module.exports = {
  friendlyName: "Get art-collections",

  description: "Get all art-collections.",

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
      "Running admin/art-collections/get.js with inputs " +
        JSON.stringify(inputs)
    );
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

      let where = { id: { "!=": null } };
      if (query.filter) {
        var filter = JSON.parse(query.filter);

        if (filter.q) {
          filter.q = filter.q.toLowerCase();
          where.or = [{ title: { contains: filter.q } }];
          if (parseInt(filter.q)) {
            where.or.push({ id: parseInt(filter.q) });
          }
          let ids = await Artist_collection.getArtistCollectionsIdsByArtist(filter.q);
          if (ids.length) {
            where.or.push({id:ids})
          }
        }
        if (filter.id) {
          where.id = filter.id;
        }
        if (filter.artist_id) {
          where.user_id = filter.artist_id;
        }
      }

      // let order = sort[0];
      // order = Object.keys(order).map((key) => [key, order[key]])[0];
      // sails.log({ oder: order });

      sails.log({ sortaaaaa: sort });
      let collections = await Artist_collection.find({
        where: where,
        select: ["id", "user_id", "title","createdAt","is_public"],
      })
        .skip(range[0])
        .limit(range[1] - range[0] + 1)
        .sort(sort);
      if (collections.length) {
        collections[0].total = await Artist_collection.count({ where: where });
        let select = ["user_id", "name", "username", "profile_image"]
         where = {user_id:_.map(collections,"user_id")}
        let artists = await User.find({ where, select })
        

       let pinned_counts =  await User_pinned_art.getPinnedCounts(_.map(collections,"id"),"artist_collection_id");
        for (collection of collections) {
          collection.privacy = collection.is_public == true ? 'Public' : 'Private';
          collection.pinned_count = _.find(pinned_counts, { artist_collection_id: collection.id });
          collection.pinned_count = collection.pinned_count ? parseInt(collection.pinned_count.total) : 0
          
          collection.artist = { ..._.find(artists, { user_id: collection.user_id }) }
        //   collection.artist = _.filter(artists, function(currentObject) {
        //     return currentObject.user_id == collection.user_id || currentObject.id == collection.user_id;
        // })[0];
          if (collection.artist) {
            collection.artist.id = collection.artist.user_id           
            delete collection.artist.user_id
          }
          
        }
        return exits.success({
          status: true,
          message: `${collections.length} records found`,
          data: collections,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error(
        "error calling admin/art-collections/get.js",
        err.message
      );
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
