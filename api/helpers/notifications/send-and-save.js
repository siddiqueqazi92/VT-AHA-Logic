module.exports = {
	friendlyName: "Mark notification as read",

	description: "",

	inputs: {
		notification_type: {
			type: "string",
			required: true,
		},
		data: {
			type:'ref'
		}
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log("helper notifications/send-and-save started");		
		try {
			data = inputs.data
			let extra_data = ''
			let notification_recipient_id = null;
			let title = null
			let body = null
			let silent = false
			switch (inputs.notification_type) {
				case sails.config.notification.type.user_followed_you: {
					notification_recipient_id = data.following_user_id
					let user = data.user
					extra_data = {
						user: {
							id: user.id,
							profile_image: user.profile_image,
							username: user.username,
							is_artist:user.is_artist
						}
					}					
					title = `${user.username} followed you`
					body = `${user.username} followed you`
					break;
				}
				case sails.config.notification.type.art_was_pinned:
				case sails.config.notification.type.comment_on_art:{
					let art = await Art.findOne({ where: { id: data.art_id },select:["artist_id","thumbnail"]})
					notification_recipient_id = art.artist_id
					let user = data.user
					extra_data = {
						user: {
							id: user.id,
							profile_image: user.profile_image,
							username: user.username,
							is_artist:user.is_artist
						},
						art: {
							id: art.id,
							image:art.thumbnail
						}
					}	
					if (inputs.notification_type == sails.config.notification.type.comment_on_art) {
						title = `${user.username} commented on your art`
						body = `${user.username} commented on your art`
					} else {
						title = `${user.username} pinned your art`
						body = `${user.username} pinned your art`
					}
				
					break;
				}				
				case sails.config.notification.type.like_on_comment:{
					let art = await Art.findOne({ where: { id: data.comment.art_id },select:["artist_id","thumbnail"]})
					notification_recipient_id = data.comment.user_id
					let user = data.user
					extra_data = {
						user: {
							id: user.id,
							profile_image: user.profile_image,
							username: user.username,
							is_artist:user.is_artist
						},
						art: {
							id: art.id,
							image:art.thumbnail
						}
					}					
					title = `${user.username} liked your comment`
					body = `${user.username} liked your comment`
					break;
				}
				case sails.config.notification.type.order_placed:{
					let art = await Art.findOne({ where: { id: data.item.art_id },select:["artist_id","thumbnail"]})
					notification_recipient_id = art.artist_id
					let user = data.user
					extra_data = {
						user: {
							id: user.id,
							profile_image: user.profile_image,
							username: user.username,
							is_artist:user.is_artist
						},					
						art: {
							id: art.id,
							image:art.thumbnail
						},
						order: {
							id: data.order.id,
							order_art_id:data.item.id // item is order_art item
					
						}
					}					
					title = `${user.username} placed an order`
					body = `${user.username} placed an order`
					break;
				}
				case sails.config.notification.type.order_status_changed:{
					let art = await Art.findOne({ where: { id: data.order_art.art_id },select:["artist_id","thumbnail","title"]})
					let order = await Order.findOne({ where: { id: data.order_art.order },select:["user_id"]})
					notification_recipient_id = order.user_id
					let user = data.user || await User.findOne({ where: { user_id: order.user_id }, select: ["user_id", "profile_image", "username","is_artist"] })
					if (user.user_id) {
						user.id = user.user_id
					}
					extra_data = {
						user: {
							id: user.id || user.user_id,
							profile_image: user.profile_image,
							username: user.username,
							is_artist:user.is_artist
						},
						art: {
							id: art.id,
							image:art.thumbnail
						},
						order: {
							id: data.order_art.order,							
						}
					}	
					data.status = data.status == 'processing'?'processed':data.status
					title = `Your order of "${art.title}" has been ${data.status}`
					body = `Your order  of "${art.title}" has been ${data.status}`
					break;
				}
				case sails.config.notification.type.art_soldout:{
					let art = data.art					
					notification_recipient_id = art.artist_id
					let aha_artist = await User.getAhaArtist();
					
					extra_data = {	
						user: {
							id:aha_artist.user_id,
							profile_image: aha_artist.profile_image,
							username: aha_artist.username,
							is_artist:true
						},
						art: {
							id: art.id,
							image:art.thumbnail
						},					
					}					
					title = `Your art "${art.title}" is out of stock`
					body = `Your art "${art.title}" is out of stock`
					break;
				}
			}			
		
			  await sails.helpers.firebase.sendPushNotification(
				notification_recipient_id,				
				title,
				body,
				silent,
				JSON.stringify(extra_data),
				inputs.notification_type
			  );
			  await sails.helpers.notifications.save(
				notification_recipient_id,				
				title,
				body,				
				JSON.stringify(extra_data),
				inputs.notification_type
			  );
		} catch (err) {
			sails.log.error(`Error in helper notifications/send-and-save. ${err}`);
    }
    sails.log("helper notifications/send-and-save ended");
		return exits.success(true);
	},
};
