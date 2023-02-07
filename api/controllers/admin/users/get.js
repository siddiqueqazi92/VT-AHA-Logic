const { capitalizeFirstLetter } = require("../../../util");

module.exports = {
  friendlyName: "Get users",

  description: "Get all users.",

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
      "Running admin/users/get.js with inputs " + JSON.stringify(inputs)
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

      let where = { id: { "!=": null } };
      if (query.filter) {
        let filter = JSON.parse(query.filter);

        if (filter.q) {
          filter.q = filter.q.toLowerCase();
          where.or = [
            { name: { contains: filter.q } },
            { username: { contains: filter.q } },
          ];          
          // if (parseInt(filter.q)) {
          //   where.or.push({ id: parseInt(filter.q) });
          // }
        }
        if (!_.isUndefined(filter.id)) {
          where.user_id = filter.id;
        }
        if (!_.isUndefined(filter.is_artist)) {
          where.is_artist = filter.is_artist;
        }
        if (!_.isUndefined(filter.community_id)) {
          let follower_ids = await Community_follower.getFollowerIds(filter.community_id)
          where.user_id = follower_ids
        }
        if (!_.isUndefined(filter.follower_id)) {
          let following_ids = await Artist_follower.getFollowingIds(filter.follower_id)
          where.user_id = following_ids
        }
        if (!_.isUndefined(filter.following_id)) {
          let following_ids = await Artist_follower.getFollowerIds(filter.following_id)
          where.user_id = following_ids
        }
      }

      // let order = sort[0];
      // order = Object.keys(order).map((key) => [key, order[key]])[0];
      // sails.log({ oder: order });

      sails.log({ sortaaaaa: sort });
      let users = await User.find({
        where: where,
        select: [
          "user_id",
          "name",
          "country_code",
          "contact",
          "username",
          "profile_image",
          "is_artist",
          "is_active",
          "createdAt",
          "login_type"
        ],
      })
        .skip(range[0])
        .limit(range[1] - range[0] + 1)
        .sort(sort);
      if (users.length) {
        let user_ids = _.map(users,"user_id")
        let following_counts = await User.getFollowingCounts(user_ids)
        let follower_counts = await User.getFollowerCounts(user_ids)
        users[0].total = await User.count({ where: where });
        users = users.map(function (o) {
          o.following_count = _.find(following_counts, { follower_id: o.user_id });
          o.following_count = o.following_count ? parseInt(o.following_count.total) : 0
          
          o.follower_count = _.find(follower_counts, { artist_id: o.user_id });
				  o.follower_count = o.follower_count ? parseInt(o.follower_count.total) : 0
          o.id = o.user_id;
          delete o.user_id;         
          if (o.login_type == 'simple') {
            o.login_type = 'number'
          }
          o.login_type = capitalizeFirstLetter(o.login_type)
          return o;
        });

        return exits.success({
          status: true,
          message: `${users.length} records found`,
          data: users,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/users/get.js", err.message);
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
