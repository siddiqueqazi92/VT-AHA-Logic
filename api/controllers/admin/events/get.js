module.exports = {
  friendlyName: "Get events",

  description: "Get all events.",

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
      "Running admin/events/get.js with inputs " + JSON.stringify(inputs)
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
          where.or = [{ Name: { contains: filter.q } }];
          if (parseInt(filter.q)) {
            where.or.push({ _id: parseInt(filter.q) });
          }
        }
        if (filter.id) {
          where.id = filter.id;
        }      
      }
      
      let events = await Event.find({
        where: where,
        select: ["_id", "Name", "Headline", "StartTime","CreatedBy","Address"],
      }).meta({makeLikeModifierCaseInsensitive: true})
        .skip(range[0])
        .limit(range[1] - range[0] + 1)
        .sort(sort);
      if (events.length) {
        events[0].total = await Event.count({ where: where });
        for (event of events) {
          event.id = event._id
          delete event._id
         
       }
        return exits.success({
          status: true,
          message: `${events.length} records found`,
          data: events,
        });
      }
      return exits.ok({
        status: false,
        message: "",
        data: [],
      });
    } catch (err) {
      sails.log.error("error calling admin/events/get.js", err.message);
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
