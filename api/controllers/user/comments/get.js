module.exports = {
	friendlyName: "Get",

	description: "Get comments",

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
			defaultsTo: 10,
		},
		art_id: {
			type:'number'
		  },
		collection_id: {
			type:'number'
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
			"Running user/comments/get.js with inputs " + JSON.stringify(inputs)
		);		
		try {
			let where = { parent_id:null }
			if (inputs.art_id) {
				where.art_id = inputs.art_id				
			}
			if (inputs.collection_id) {
				where.collection_id = inputs.collection_id				
			}
			let comments = await Comment.getComments(inputs.user, where, inputs.offset, inputs.limit);			
			if (!comments.length) {
				return exits.ok({
					status: true,
					message: "Comments not found",		
					data:{comments:[],remaining_comments:0}
				});
			}			
			let total_comments = await Comment.count({ where })
			let remaining_comments = total_comments -comments.length - inputs.offset;
			 remaining_comments = remaining_comments > 0 ? remaining_comments : 0;
			return exits.success({
				status: true,
				message: `${comments.length} comments Found Successfully`,
				data:{remaining_comments ,comments}
			});
		} catch (err) {
			sails.log.error("error calling user/comments/get.js", err.message);
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
