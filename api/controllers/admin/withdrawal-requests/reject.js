module.exports = {
  friendlyName: "reject",

  description: "reject transfer request.",

  inputs: {
    // admin: {
    //   type: 'ref',
    //   required: true,
    //   description: 'logged in admin'
    // },
    id: {
      type: "number",
      required: true,
    },   
    user_id: {
      type: "string",
      required: true,
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
    updated: {
      responseType: "updated",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "Running admin/withdrawal-requests/reject.js with inputs " +
        JSON.stringify(inputs)
    );
    try {
      let statuses = await sails.helpers.statuses.get([global.STATUS.PENDING]);	
      let where = { user_id: inputs.user_id,id:inputs.id ,status:statuses[global.STATUS.PENDING]};

      let wr = await Withdrawal_request.findOne({
        where: where,
        select: ["available_amount","stripe_account_id","user_id"],
      });

      if (!wr) {
        return exits.ok({
          status: false,
          message: "Invalid ID",
          data: [],
        });
      }    
      updated = await Withdrawal_request.rejectWithdrawalRequest(wr)
      if (!updated) {
        return exits.ok({
          status: false,
          message: "Unable to process",
          data: [],
        });
      }
      
      return exits.updated({
        status: true,
        message: "Processed successfully",
        data: [],
      });
    } catch (err) {
      sails.log.error(
        "error calling admin/withdrawal-requests/reject.js",
        err.message
      );
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
