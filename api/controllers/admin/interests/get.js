const { JsonWebTokenError } = require("jsonwebtoken");

module.exports = {
  friendlyName: "Get interests",

  description: "Get all interests.",

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
      "Running admin/interests/get.js with inputs " + JSON.stringify(inputs)
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
      }

      // let order = sort[0];
      // order = Object.keys(order).map((key) => [key, order[key]])[0];
      // sails.log({ oder: order });

      sails.log({ sortaaaaa: sort });
      let interests = await Interest.find({
        where: where,
        select: ["id", "title", "image", "createdAt"],
      })
        .skip(range[0])
        .limit(range[1] - range[0] + 1)
        .sort(sort);
      if (interests.length) {
        interests[0].total = await Interest.count({ where: where });
        if (!_.isUndefined(filter) && filter.trim_title_length) {
          interests = _.map(interests, function (o) {
            if (o.title.length > 15) {
              o.title =
                o.title.substring(0, parseInt(filter.trim_title_length)) +
                "...";
            }
            return o;
          });
        }
        return exits.success({
          status: true,
          message: `${interests.length} records found`,
          data: interests,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/interests/get.js", err.message);
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
