const shippo = require('shippo')(sails.config.shippo.api_token);
const lodash = require("lodash");

module.exports = {


  friendlyName: 'Create',


  description: 'Create shipments.',


  inputs: {
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

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
	  sails.log("helper shippo/shipments/create started");
	  sails.log('inputs in  helper shippo/shipments/calculate-charges:',inputs)
	  let shipment = null
	  let total_shipping_charges = 0
	  let shipping_objects = []
    try {						
			let cart = inputs.cart;
			let address = inputs.address;			
			
			
			
		if (cart.length) {
			if (!_.isUndefined(cart[0].art_id)) {
				for (let o of cart) {
					o.id = o.art_id
					delete o.art_id
				}		
			}
				let art_ids = _.map(cart, "id")
				let artist_addresses = await User_address.getArtistsPickingPointByArtIds(art_ids)
				var current_artist_address = null
								
			let last_artist_address = _.find(artist_addresses, { art_id: cart[0].id })
			last_artist_address.street1 = last_artist_address.street
			let parcels = []
			let address_from,address_to
				for (item of cart) {
					 current_artist_address = _.find(artist_addresses, { art_id: item.id })
					if (!current_artist_address) {
						return exits.success(data);
					}
					if (!item.template) continue;
					parcels = []				
					parcels.push({
						name:item.title,
						template:item.template,
						weight:item.weight*item.quantity,
						mass_unit: item.mass_unit,
						metadata:`art_id:${item.id}`
					})					
						//create shipment here					
						
						address.street1 = address.street
						current_artist_address.street1 = current_artist_address.street
									
					// 	let  address_from = {
					// 		"name": "Mr Hippo",
					// 		"street1": "965 Mission Street",        
					// 		"city": "San Francisco",
					// 		"state": "CA",
					// 		"zip": "94103",
					// 		"country": "US"
					//   }
					//   let address_to = {
					// 	  "name": "Mr Hippo",
					// 	  "street1": "124 Masters Court",      
					// 	  "city": "Walnut Creek",
					// 	  "state": "CA",
					// 	  "zip": "94598",
					// 	  "country": "US"     
					//   }
					   address_from = (({ name, street1,city,state,zip,country }) => ({ name, street1,city,state,zip,country }))(current_artist_address);
					   address_to = (({ title, street1,city,state,zip,country }) => ({ name:title, street1,city,state,zip,country }))(address);
					  sails.log({address_from,address_to,parcels})
						 shipment = await shippo.shipment.create({
							// address_from: current_artist_address,
							// address_to: address,
							address_from,
							address_to,
							parcels: parcels,
							async: false
						})
						if (shipment && shipment.rates.length) {						
							shipping_rate = lodash.minBy(shipment.rates, function(o) { return parseFloat(o.amount); });//get minimum rate object
							total_shipping_charges += parseFloat(shipping_rate.amount)	
							shipping_rate.art_id = item.id
							shipping_objects.push({shipping_rate,parcels:shipment.parcels})
						}
						console.log(total_shipping_charges)
					
				}
			
			
			}													   						
		} catch (err) {
		sails.log.error(`Error in helper shippo/shipments/calculate-charges. ${err}`);			
	}
	  if (shipping_objects.length > 0) {
		shipping_objects[0].total_shipping_charges = total_shipping_charges
	  }
	  
	return exits.success(shipping_objects);
  }


};

