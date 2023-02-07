
module.exports = {
  friendlyName: "Get",

  description: "Get orders",

  inputs: {
    user: {
      type: "ref",
    },
    offset: {
      type: "number",
      defaultsTo: 0,
    },
    limit: {
      type: "number",
      defaultsTo: 1000,
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
      "Running user/orders/get.js with inputs " + JSON.stringify(inputs)
    );
   
    try {      
      let user_id = inputs.user.id
      let where = {user_id}
     
    orderList = await Order.getOrders(where,inputs.offset,inputs.limit);
      return exits.success({
        status: true,
        message: `${orderList.length} Orders Listed Successfully`,
        data: orderList,
      });
    } catch (err) {
      sails.log.error("error calling user/orders/get.js", err.message);
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
