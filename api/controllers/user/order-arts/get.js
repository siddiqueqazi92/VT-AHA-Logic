
module.exports = {
  friendlyName: "Get",

  description: "Get orders",

  inputs: {
    user: {
      type: "ref",
    },
    user_id:{ 
      type:"string"
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
      "Running user/order-arts/get.js with inputs " + JSON.stringify(inputs)
    );
   
    try {      
      let user_id = inputs.user_id || inputs.user.id
      let filter = {user_ids:[user_id]}
      if (user_id != inputs.user.id) {
        filter.is_public = true
     }
      let order_ids = await Order.getUserOrderIds(filter);
      if (!order_ids.length) {
        return exits.ok({
          status: false,
          message: 'Order arts not found',          
        });
      }
      
     let order_arts = await Order_art.getOrderArtsByNativeQuery(order_ids,inputs.offset,inputs.limit)
      return exits.success({
        status: true,
        message: `${order_arts.length} Order arts Listed Successfully`,
        data: order_arts,
      });
    } catch (err) {
      sails.log.error("error calling user/order-arts/get.js", err.message);
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
