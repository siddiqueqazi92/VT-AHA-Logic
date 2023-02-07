module.exports = {
  friendlyName: "Get statuses",

  description: "",

  inputs: {
    slugs: {
      type: "json",
      required: false,
    },
    ids: {
      type: "json",
      required: false,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("calling helpers/statuses/get");
    let where = { id: {"!=":null} };
    if (!_.isUndefined(inputs.ids)) {
      where.id = inputs.ids;
    }
    if (!_.isUndefined(inputs.slugs)) {
      where.slug = inputs.slugs;
    }
    const statuses = await Status.find(where);
    const all_statuses = {};
    if (statuses.length) {
      statuses.forEach((status) => {
        all_statuses[status.slug] = status.id;
      });
    }
    return exits.success(all_statuses);
  },
};
