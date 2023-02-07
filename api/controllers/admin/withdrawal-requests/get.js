module.exports = {
  friendlyName: "Get withdrawal requests",

  description: "Get all withdrawal requests.",

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
      "Running admin/withdrawal-requests/get.js with inputs " + JSON.stringify(inputs)
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
      let statuses = await sails.helpers.statuses.get([global.STATUS.PENDING])
      let where = { status: {"!=":null} };
      if (query.filter) {
        let filter = JSON.parse(query.filter);

        if (filter.q) {
          // filter.q = filter.q.toLowerCase();
          // where.or = [
          //   { user: { contains: filter.q } },
          //   { username: { contains: filter.q } },
          // ];          
          // if (parseInt(filter.q)) {
          //   where.or.push({ id: parseInt(filter.q) });
          // }
        }
        if (!_.isUndefined(filter.id)) {
          where.user_id = filter.id;
        }
  
      }
    
      sails.log({ sortaaaaa: sort });
      let withdrawal_requests = await Withdrawal_request.find({
        where: where,
        select: [
          "user_id",          
          "stripe_account_id",
          "available_amount",          
          "createdAt",
        ],
      }).populate('status')
        .skip(range[0])
        .limit(range[1] - range[0] + 1)
        .sort(sort);
      if (withdrawal_requests.length) {
        withdrawal_requests[0].total = await Withdrawal_request.count({ where: where });
        let users = await User.find({ where: { user_id:_.map(withdrawal_requests,"user_id") },select:['user_id','username',"profile_image"]})
        for (wr of withdrawal_requests) {
          wr.status = wr.status.display_name
          wr.user = _.find(users, { user_id: wr.user_id })          
        }
        return exits.success({
          status: true,
          message: `${withdrawal_requests.length} records found`,
          data: withdrawal_requests,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/withdrawal-requests/get.js", err.message);
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
