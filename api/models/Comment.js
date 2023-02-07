/**
 * Comment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	tableName: "comments",
	attributes: {
		user_id: {
			type: "string",
			required: true,
		},
		parent_id: {
			model: "comment",
		},
		art_id: {
			model: "art",
		},
		collection_id: {
			model: "artist_collection",
		},
		body: {
			type: "string",
		},
		recipient_id: {
			type: "string",
			allowNull:true

		  },
	},
	customToJSON: function () {
		if (this.createdAt) {
			this.created_at = this.createdAt;
			delete this.createdAt;
		}
		return _.omit(this, ["updatedAt"]);
	},
	getComments: async function (
		user,
		where,
		offset = 0,
		limit = 1000,
		sort = "id DESC",
		select = []
	) {
		let comments = [];
		try {
			let find = { where };
			if (select.length) {
				find.select = select;
			}

			comments = await Comment.find(find).skip(offset).limit(limit).sort(sort);
			if (comments.length) {
				// let user_ids =  _.map(comments, "user_id")
				let user_ids = [...new Set(comments.map(item => item.user_id))];
				let recipient_ids = _.compact([...new Set(comments.map(item => item.recipient_id))])
				user_ids = user_ids.concat(recipient_ids)
				let users = await User.find({
					where: { user_id: user_ids},
					select: ["user_id", "username", "name", "profile_image","is_artist"],
				});

				let replies = await Comment.find({ parent_id: _.map(comments, "id") });
				let likes = await Comment_like.find({ comment: _.map(comments, "id") });
				for (comment of comments) {
					comment.is_my_comment = user.id == comment.user_id;
					comment.liked = _.countBy(likes, (like) => like.comment == comment.id && like.user_id == user.id);
					comment.liked = !_.isUndefined(comment.liked['true'])&& comment.liked['true'] > 0?true:false
					comment.likes = _.countBy(likes, (like) => like.comment == comment.id);;
					comment.likes = !_.isUndefined(comment.likes['true'])?comment.likes['true']:0
					comment.user = _.find(users, { user_id: comment.user_id });					
					comment.recipient = _.find(users, { user_id: comment.recipient_id }) || null;
					delete comment.recipient_id

					comment.replies = _.filter(replies, function (i) {
						return i.parent_id == comment.id;
					});
					comment.replies_count = comment.replies.length
					if (comment.replies.length) {
						 user_ids = [...new Set(comment.replies.map(item => item.user_id))];
						recipient_ids = _.compact([...new Set(comment.replies.map(item => item.recipient_id))])
						user_ids = user_ids.concat(recipient_ids)
						let replies_users = await User.find({
							where: { user_id: user_ids},
							select: ["user_id", "username", "name", "profile_image","is_artist"],
						});
						 
						for (reply of comment.replies) {
							reply.is_my_comment = user.id == reply.user_id;
							reply.liked = true;
							reply.likes = 10;
							reply.user = _.find(replies_users, { user_id: reply.user_id });
							reply.recipient = _.find(replies_users, { user_id: reply.recipient_id }) || null;
							delete reply.recipient_id
						}
					}
					delete comment.user_id;
				}
			}
		} catch (err) {
			sails.log(`Error in Model Comment, function getUserComments. ${err} `);
		}
		return comments;
	},
};
