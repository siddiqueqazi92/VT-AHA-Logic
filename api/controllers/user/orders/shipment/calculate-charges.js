
module.exports = {
	friendlyName: "Create",

	description: "Create order",

	inputs: {
		user: {
			type: "ref",
			description: "Logged in user",
		},
		cart: {
			type: "ref",
			required: true,
		},
		address: {
			type: "ref",
			required: false,
		},		
	},

	exits: {
		invalid: {
			responseType: "badRequest",
			description: "",
		},
		ok: {
			responseType: "ok",
			description: "",
		},
	},

	fn: async function (inputs, exits) {
		sails.log(`action user/orders/shipment/calculate-charges started.`);
		sails.log('inputs:',inputs)
		try {
			let is_valid_address = await sails.helpers.shippo.addresses.isValid(inputs.address.title, inputs.address.country, inputs.address.state, inputs.address.city, inputs.address.zip, inputs.address.street)
            if (is_valid_address.is_valid === false) {
              return exits.ok({
                status: false,
                message: is_valid_address.message || 'Invalid address',          
              });
            }
			let shipment_art =_.filter(inputs.cart, function(elem) { return elem.template !== null && !_.isEmpty(elem.template); }); 
		let data = 0
		let shipment_data = await sails.helpers.shippo.shipments.calculateCharges(inputs.cart,inputs.address)
			if (shipment_data.length > 0 &&!_.isUndefined(shipment_data[0].total_shipping_charges)) { 
				data = parseFloat(shipment_data[0].total_shipping_charges)
			}						
			sails.log('shipment_data:',shipment_data)
			if (shipment_art.length >0 && data === 0) {
				return exits.ok({
					status: true,
					message: "",
					data
				});
			}
			return exits.success({
				status: true,
				message: "Shipment charges calculated successfully",
				data:data > 0?data.toFixed(2):0
			});
		} catch (err) {
			sails.log.error(`Error in action user/orders/shipment/calculate-charges. ${err}`);
			return exits.invalid(err.message || "Server error: can not create order");
		}
	},
};
