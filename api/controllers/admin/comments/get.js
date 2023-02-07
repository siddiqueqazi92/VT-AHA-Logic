

module.exports = {
  friendlyName: "Get comments",

  description: "Get all comments.",

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
      "Running admin/comments/get.js with inputs " + JSON.stringify(inputs)
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
        }
        if (filter.id) {
          where.id = filter.id;
        }
        if (filter.art_id) {
          where.art_id = filter.art_id;
        }
      }

      // let order = sort[0];
      // order = Object.keys(order).map((key) => [key, order[key]])[0];
      // sails.log({ oder: order });

      sails.log({ sortaaaaa: sort });
      let comments = await Comment.find({
        where: where,
        select: ["id", "user_id", "body", "createdAt"],
      })
        .skip(range[0])
        .limit(range[1] - range[0] + 1)
        .sort(sort);
      if (comments.length) {
        let comment_ids = _.map(comments, "id");
        let likes = await Comment_like.getLikesCount(comment_ids)
        let users = await User.find({where:{user_id:_.map(comments,"user_id")},select:["user_id","username","name"]})
        comments[0].total = await Comment.count({ where: where });
        comments = _.map(comments, function (o) {
          o.likes = _.find(likes, { comment_id: o.id })
          o.likes = !_.isUndefined(o.likes)?parseInt(o.likes.likes):0
          o.user = _.find(users, { user_id: o.user_id })
          delete o.user_id
          if (!_.isUndefined(filter) && filter.trim_title_length && o.title.length > 15) {
            o.title =
              o.title.substring(0, parseInt(filter.trim_title_length)) +
              "...";
          }
          return o;
        });
       
        return exits.success({
          status: true,
          message: `${comments.length} records found`,
          data: comments,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/comments/get.js", err.message);
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
