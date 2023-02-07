module.exports = {
  friendlyName: "Get",

  description: "Get orders",

  inputs: {
    user: {
      type: "ref",
    },
    id: {
      type: "number",
      required:true
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
      "Running user/orders/get-one.js with inputs " + JSON.stringify(inputs)
    );    
    
    try {
     
      let user_id = inputs.user.id
      let id = inputs.id
      let where = {user_id,id}
     
      order = await Order_art.getOrder(where)
      return exits.success({
        status: true,
        message: "Order Found Successfully",
        data: order,
      });
    } catch (err) {
      sails.log.error("error calling user/orders/get-one.js", err.message);
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
