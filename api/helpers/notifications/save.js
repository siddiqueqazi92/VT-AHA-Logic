module.exports = {
	friendlyName: "Mark notification as read",

	description: "",

	inputs: {
	    user_id: {
			type: "string",
			required: true,
			description: "A user id",
		  },
		 
		  title: {
			type: "string",
		  },
	  
		  body: {
			type: "string",
		  },
	  		
		  extra_data: {
			type: "ref",
			required: true,
		  },
		  notification_type: {
			type: "string",
			required: true,
		  },
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log("helper notifications/save started");		
		try {				
			await User_notification.create(inputs)
					 
		} catch (err) {
			sails.log.error(`Error in helper notifications/save. ${err}`);
    }
    sails.log("helper notifications/save ended");
		return exits.success(true);
	},
};
