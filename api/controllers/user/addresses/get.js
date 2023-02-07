module.exports = {
	friendlyName: "Get",

	description: "Get addresses",

	inputs: {
		user: {
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
			"Running user/addresses/get.js with inputs " + JSON.stringify(inputs)
		);

		try {
			addressList = await User_address.find({
				where: { user_id: inputs.user.id },
				select: ["id", "title", "country", "state","city", "street","zip", "is_selected","is_picking_point"],
      })
      .sort([
        { is_selected: 'DESC' },
        { id: 'DESC' },
      ]);
     //   .sort("is_selected DESC");
	  for(address of addressList){address.address = address.street}
			return exits.ok({
				status: true,
				message: "Addesses Listed Successfully",
				data: addressList,
			});
		} catch (err) {
			sails.log.error("error calling user/addresses/get.js", err.message);
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
