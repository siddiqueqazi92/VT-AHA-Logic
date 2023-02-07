module.exports = {
  friendlyName: "Get sort filters",

  description: "",

  inputs: {
    query: {
      type: "ref",
      required: true,
    },
    native: {
      type: "boolean",
      defaultsTo: false,
    },
  },

  exits: {
    success: {
      outputFriendlyName: "Sort filters",
    },
  },

  fn: async function (inputs, exits) {
    sails.log("calling helper get-sort-filters");

    var sort = [];
    var str = "";
    var order = "";
    if (
      !_.isUndefined(inputs.query.sort) &&
      !_.isUndefined(inputs.query.sort)
    ) {
      JSON.parse(inputs.query.sort).forEach(function (i) {
        var obj = {};
        order = i.order;
        obj[i.field] = i.order;
        //obj[i.field] = "DESC";
        sort.push(obj);
        str += `${i.field},`;
      });
      str = str.substring(0, str.length - 1) + ` ${order}`;
      //str = str.replace("ASC", "DESC");
    } else {
      sort.push({ id: "DESC" });
    }
    if (inputs.native === true) {
      if (!str) {
        str = "createdAt DESC";
      }
      sort = str;
    }
    //sails.log({ sortInGetSortFilters: sort });
    return exits.success(sort);
  },
};
