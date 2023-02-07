const fs = require("fs"); // Or `import fs from "fs";` with ESM
const path = require("path");
const AWS = require("aws-sdk");

if (typeof atob === "undefined") {
	global.atob = function (b64Encoded) {
		return new Buffer(b64Encoded, "base64").toString("binary");
	};
}
function uploadToAWS(base64, filename, art_id, model) {
	var s3Bucket = new AWS.S3({ params: { Bucket: sails.config.aws.bucket } });

	buf = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
	var params = {
		Key: filename,
		Body: buf,
		ContentEncoding: "base64",
		ContentType: "image/png",
		ACL: "public-read",
	};

	s3Bucket.upload(params, function (err, data) {
		if (err) {
			sails.log.error("Error uploading data: ", params);
		}
		sails.models[model]
			.update({ id: art_id })
			.set({ thumbnail: data.Location })
			.then((result) => {
				sails.log({ result });
				data.result = result;
			});
		sails.log(`File uploaded successfully. File path: ${data.Location}`);
		// imagePath = data.Location;
		return data.Location;
	});
}
module.exports = {
	addUserInCommunities: async function (user_id, items) {
		try {
			let item_ids = _.map(items, "art_id");
			let artists = await Art.find({
				where: { id: item_ids },
				select: ["artist_id"],
			});
			if (artists.length) {
				let communites = await Community.find({
					where: { artist_id: _.map(artists, "artist_id") },
					select: ["id"],
				});
				if (communites.length) {
					await Community_follower.addFollower(
						user_id,
						_.map(communites, "id")
					);
				}
			}
		} catch (err) {
			sails.log.error(
				`Error in util/index.js, function: addUserInCommunities. ${err}`
			);
		}
	},
	updateWallets: async function (items, order_id) {
		try {
			for (item of items) {
				let art = await Art.findOne({
					where: { id: item.art_id },
					select: ["artist_id"],
				});
				if (art) {
					await module.exports.updateArtistWallet(
						art.artist_id,
						item.price * item.quantity
					);
					await module.exports.addWalletHistory(art.artist_id, order_id, item);
				}
			}
		} catch (err) {
			sails.log.error(`Error in util/index.js, function updateWallets. ${err}`);
		}
	},
	updateArtistWallet: async function (user_id, item_total) {
		try {
			let aha_commission_percent = global.AHA_COMMISSION; //percentage, will be fetched dynamically later;
			let aha_commission = (item_total * aha_commission_percent) / 100;
			let artist_earning = item_total - aha_commission;
			let user = await User.findOne({ where: { user_id }, select: ["wallet"] });
			if (user) {
				await User.updateOne({ user_id }).set({
					wallet: parseFloat(user.wallet) + artist_earning,
				});
			}
			return true;
		} catch (err) {
			sails.log.error(
				`Error in util/index.js, function updateArtistWallet. ${err}`
			);
		}
	},
	updateAmounts: async function (items, column_to_update, operator = "+") {
		try {
			for (item of items) {	
				let art = item
				if (!item.artist_id) {
					 art = await Art.findOne({
						where: { id: item.art_id },
						select: ["artist_id"],
					});
				}
			
				if (art) {
					await module.exports.updateArtistAmount(
						art.artist_id,
						item.price * item.quantity,
						column_to_update,
						operator
					);
				}
			}
		} catch (err) {
			sails.log.error(
				`Error in util/index.js, function updatePendingAmounts. ${err}`
			);
		}
	},
	updateArtistAmount: async function (
		user_id,
		item_total,
		column_to_update,
		operator = "+"
	) {
		try {
			let aha_commission = await module.exports.getAhaCommission(
				item_total
			);
			artist_earning = item_total - aha_commission;
			let user = await User.findOne({
				where: { user_id },
				select: ["pending_amount", "available_amount", "total_amount"],
			});
			switch (operator) {
				case "+": {					
					if (user) {
						let obj = {};
						obj[column_to_update] =
							parseFloat(user[column_to_update]) + artist_earning;
						if (column_to_update == "available_amount") {
							obj.total_amount = parseFloat(user.total_amount) + artist_earning;
						}
						await User.updateOne({ user_id }).set(obj);
					}
					break;
				}
				case "-": {					
					if (user) {
						let obj = {};
						obj[column_to_update] =
							parseFloat(user[column_to_update]) - artist_earning;
						if (column_to_update == "available_amount") {
							obj.total_amount = parseFloat(user.total_amount) - artist_earning;
						}
						await User.updateOne({ user_id }).set(obj);
					}
					break;
				}
			}

			return true;
		} catch (err) {
			sails.log.error(
				`Error in util/index.js, function updateArtistPendingAmount. ${err}`
			);
		}
	},
	getAhaCommission: function (total) {
		let aha_commission_percent = global.AHA_COMMISSION;
		return (total * aha_commission_percent) / 100;
	},
	addWalletHistory: async function (artist_id, order_id, item) {
		try {
			let obj = {
				artist_id,
				order: order_id,
				title: item.title,
				art: item.art_id,
				order_art:item.id
			};
			let aha_commission_percent = 10; //percent;
			let item_total = item.price * item.quantity;
			let aha_commission = (item_total * aha_commission_percent) / 100;
			let artist_earning = item_total - aha_commission;
			obj.amount = artist_earning;
			await Artist_wallet_history.create(obj);
			return true;
		} catch (err) {
			sails.log.error(
				`Error in util/index.js, function addWalletHistory. ${err}`
			);
		}
	},

	generateVideoThumbnail: function (art_id, uri, model = "art") {
		sails.log("helper generate thumbnail started");
		try {
			let filename = "tn-" + path.parse(path.basename(uri)).name;

			const { dirname } = require("path");
			let appDir = dirname(require.main.filename);
			my_path = `${appDir}/assets/images/thumbnails`;

			sails.log({ pathExist: fs.existsSync(my_path), appDir });
			const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
			const ffmpeg = require("fluent-ffmpeg");
			ffmpeg.setFfmpegPath(ffmpegPath);

			ffmpeg(uri)
				.on("end", function (data) {
					console.log(`Screenshots taken. data ${data}`);

					var bitmap = fs.readFileSync(my_path + "/" + filename + ".png");
					// convert binary data to base64 encoded string
					base64 = new Buffer(bitmap).toString("base64");
					tn_url = uploadToAWS(base64, filename + ".png", art_id, model);
					//base64_encode(path+"/"+filename+".png")
					return true;
				})
				.on("error", function (err) {
					console.error({ errIntakingScreenshots: err });
				})
				.screenshots({
					// Will take screenshots at 20%, 40%, 60% and 80% of the video
					count: 1,
					filename: filename + ".png",
					folder: my_path,
				});
		} catch (err) {
			sails.log.error(`Error in helper generate-thumbnail. ${err}`);
		}
	},
	updateVideoThumbnails: function (art_resources) {
		try {
			for (ar of art_resources) {
				if (ar.type.includes("video")) {
					try {
						module.exports.generateVideoThumbnail(
							ar.id,
							ar.uri,
							"art_resource"
						);
					} catch (err) {
						sails.log.error(
							`Error in util/index.js,function updateVideoThumbnails. ${err}`
						);
					}
				}
			}
		} catch (err) {
			sails.log.error(
				`Error in util/index.js,function updateVideoThumbnails. ${err}`
			);
		}
	},
	getPinCountArt: function (pinned_art_counts, art_id) {
		let pin_like_count = 0;
		try {
			pin_like_count = _.find(pinned_art_counts, { art_id });
			pin_like_count = !_.isUndefined(pin_like_count)
				? parseInt(pin_like_count.total)
				: 0;
		} catch (err) {
			sails.log.error(`Error in util/index.js,function getPinCountArt. ${err}`);
		}
		return pin_like_count;
	},
	getPinCountArtistCollection: function (
		pinned_artist_collections_counts,
		artist_collection_id
	) {
		let pin_like_count = 0;
		try {
			pin_like_count = _.find(pinned_artist_collections_counts, {
				artist_collection_id,
			});
			pin_like_count = !_.isUndefined(pin_like_count)
				? parseInt(pin_like_count.total)
				: 0;
		} catch (err) {
			sails.log.error(
				`Error in util/index.js,function getPinCountArtistCollection. ${err}`
			);
		}
		return pin_like_count;
	},
	reverseKeyValues: function (obj) {
		let data = {};
		try {
			data = _.transform(obj, function (res, val, key) {
				if (_.isPlainObject(val)) {
					res[key] = deepInvert(val);
				} else {
					res[val] = key;
				}
			});
		} catch (err) {
			sails.log.error(
				`Error in util/index.js,function reverseKeyValues. ${err}`
			);
		}
		return data;
	},
 	formatAmount: function(num, digits) {
		const lookup = [
		  { value: 1, symbol: "" },
		  { value: 1e3, symbol: "k" },
		  { value: 1e6, symbol: "M" },
		  { value: 1e9, symbol: "G" },
		  { value: 1e12, symbol: "T" },
		  { value: 1e15, symbol: "P" },
		  { value: 1e18, symbol: "E" }
		];
		const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
		var item = lookup.slice().reverse().find(function(item) {
		  return num >= item.value;
		});
		return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
	},
	capitalizeFirstLetter: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	  }
};
