/**
 * Art.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { getPinCountArt, getPinCountArtistCollection } = require("../util");

module.exports = {
	tableName: "arts",
	attributes: {
		artist_id: {
			type: "string",
			required: true,
		},
		title: {
			type: "string",
		},
		price: {
			type: "number",
			required: false,
			allowNull: true,
		},
		max_quantity: {
			type: "number",
		},
		description: {
			type: "string",
			required: false,
			allowNull: true,
		},
		long_description: {
			type: "string",
			required: false,
			allowNull: true,
		},
		sellable: {
			type: "boolean",
		},
		shippable: {
			type: "boolean",
		},
		supportable: {
			type: "boolean",
		},
		thumbnail: {
			type: "string",
			// defaultsTo: "https://ahauserposts.s3.amazonaws.com/video-files.png",
			allowNull: true
		},
		type: {
			type: "string",
			defaultsTo: "default",
		},
		template: {
			type: "string",
			allowNull:true
		},
		weight: {
			type: "number",
			allowNull:true
		},
		mass_unit: {
			type: "string",
			allowNull:true
		},
		deletedAt: {
			type: "ref",
			columnType: "timestamp",
		},
		resources: {
			collection: "art_resource",
			via: "art",
		},
		sizes: {
			collection: "art_size",
			via: "art",
		},
		vibes: {
			collection: "art_vibe",
			via: "art",
		},
		collections: {
			collection: "art_collection",
			via: "art",
		},
	},
	customToJSON: function () {
		if (this.template && !_.isEmpty(this.template) && !_.isObject(this.template)){
			this.template = JSON.parse(this.template)
		}
		this.weight = this.weight > 0? parseFloat(this.weight).toFixed(2):0
		return _.omit(this,[]);
	},
	getOne: async function (attr, select = []) {
		let find = {};
		find.where = { ...attr };
		find.where.deletedAt = null;
		if (select.length) {
			find.select = select;
		}
		let _art = await Art.find(find).populate("sizes");
		if (_art.length) {
			_art = _art[0];
			_art.amount = parseFloat(_art.amount);
		}
		return _art;
	},
	getAll: async function (where, offset = 0, limit = 1000, sort = "id DESC", select = []) {
		if (!where.deletedAt) {
			where.deletedAt = null
		}
		let find = { where };
		if (select.length) {
			find.select = select;
		}
		let arts = await Art.find(find).skip(offset).limit(limit).sort(sort);
		if (arts.length) {
			let artists = await User.find({
				where: { user_id: _.map(arts, "artist_id") },
				select: ["user_id", "username"],
			});
			let pinned_counts = await User_pinned_art.getPinnedCounts(_.map(arts, "id"), "art_id");
			for (art of arts) {
				art.artist = _.find(artists, { user_id: art.artist_id });
				art.pinned_count = _.find(pinned_counts, { art_id: art.id });
				art.pinned_count = art.pinned_count ? parseInt(art.pinned_count.total) : 0
			}
		}
		return arts;
	},
	getArtsWithCustomSorting: async function (ids, offset = 0, limit = 1000) {		
		let arts = [];

		try {
			let query = `
			SELECT a.*
			FROM   arts a
			JOIN   unnest('{${ids.toString()}}'::int[]) WITH ORDINALITY t(id, ord) USING (id)
			WHERE a."deletedAt" is null
			ORDER  BY t.ord
			OFFSET ${offset} LIMIT ${limit};
			`;
			sails.log(query)
			let result = await sails.sendNativeQuery(query)
			if (result.rows.length) {
				arts = result.rows
				let artists = await User.find({
					where: { user_id: _.map(arts, "artist_id") },
					select: ["user_id", "username"],
				});
				//getting pinned counts for arts
				let pinned_art_counts = await User_pinned_art.getPinnedCounts(_.map(arts, "id"));				
				for (art of arts) {
					art.pin_like_count = getPinCountArt(pinned_art_counts,art.id)
					art.artist = _.find(artists, { user_id: art.artist_id });
					// art.artist.id = art.artist.user_id
					// delete art.artist.user_id
				}
			}
			
		} catch (err) {
			sails.log.error(`Error in model Art, function getArtsWithCustomSorting. ${err}`);
		}
		return arts;
	},
	getAllWithSizes: async function (where, select = [], offset = 0, limit = 1000, sort ="id DESC") {
		let find = { where };
		if (select.length) {
			find.select = select;
		}
		let arts = await Art.find(find).populate('sizes').skip(offset).limit(limit).sort(sort);
		return arts;
	},
	getArts: async function (user, filtered_params = {}, offset = 0, limit = 10) {
		try {
			let arts = [];
			let where = ` a."deletedAt" IS NULL`;
			if (filtered_params.id) {
				if (Array.isArray(filtered_params.id)) {
					where += ` AND a.id IN (${filtered_params.id.toString()})`;
				} else {
					where += ` AND a.id = ${filtered_params.id}`;
				}
				
			}			
			if (filtered_params.exclude) {
				where += ` AND a.id not in (${filtered_params.exclude})`;
			}
			if (filtered_params.type) {
				where += ` AND a.type = '${filtered_params.type}'`;
			}
			let and = "";
			if (filtered_params.vibes) {
				and += ` (av.vibe_id in (${filtered_params.vibes.toString()})`;
			}
			if (filtered_params.artists) {
				let artist_ids = "'" + filtered_params.artists.join("', '") + "'";
				and += _.isEmpty(and)
					? ` (a.artist_id in (${artist_ids})`
					: ` AND a.artist_id in (${artist_ids})`;
			}
			if (filtered_params.country) {
				and += _.isEmpty(and)
					? `(u.country = '${filtered_params.country}')`
					: ` AND u.country = '${filtered_params.country}')`;
			}
			if (and) {
				where += " AND ";
				where += and;
			} else {
			}
			let query = `
    SELECT DISTINCT a.*,u.name AS profile_name,u.username AS profile_tag_id,u.profile_image AS image,u.cover_image
    FROM arts a
    LEFT JOIN art_vibes av
    ON av.art_id = a.id
    LEFT JOIN artist_followers af
     ON af.artist_id = a.artist_id
  	LEFT JOIN users u
      ON u.user_id = a.artist_id
    WHERE ${where}
    ORDER BY a."createdAt" DESC  OFFSET ${offset} LIMIT ${limit}`;
			sails.log(query);
			let result = await sails.sendNativeQuery(query);
			if (result.rows) {
				arts = result.rows;
				if (arts.length < limit) {
					where = `a."deletedAt" IS NULL AND a.type = 'default'`;
					if (filtered_params.exclude) {
						where += ` AND a.id not in (${filtered_params.exclude})`;
					}
					if (arts.length > 0) {
						where += ` AND a.id NOT IN (${_.map(arts, "id").toString()})`;
					}
					if (filtered_params.id) {
						if (Array.isArray(filtered_params.id)) {
							where += ` AND a.id IN (${filtered_params.id.toString()})`;
						} else {
							where += ` AND a.id = ${filtered_params.id}`;
						}
						
					}		
					query = ` 
          SELECT DISTINCT a.*,u.name AS profile_name,u.username AS profile_tag_id,u.profile_image AS image,u.cover_image,av.art_id
          FROM arts a
          LEFT JOIN art_vibes av
          ON av.art_id = a.id
          LEFT JOIN artist_followers af
           ON af.artist_id = a.artist_id
          LEFT JOIN users u
            ON u.user_id = a.artist_id
          WHERE  ${where}
          ORDER BY a."createdAt" DESC  OFFSET 0 LIMIT ${
						limit - arts.length
					}`;
					sails.log(query);
					
						result = await sails.sendNativeQuery(query);

						arts = _.union(arts, result.rows);
					
				
				}
				let all_art_ids = _.map(arts, "id")
				let all_resources = await Art_resource.find({
					where: { art: all_art_ids },
					select: ["id", "type", "uri", "thumbnail", "art"],
				});
				let all_sizes = await Art_size.find({
					where: { art: all_art_ids },
					select: ["size", "art", "price", "quantity","template","weight","mass_unit"],
				}).sort('id ASC');
				let pinned_items = await User_pinned_art.getPinnedItemIds({ user_id: user.user_id })
				let pinned_art_ids = pinned_items.art_ids
				let artist_collection_ids = pinned_items.artist_collection_ids
				let art_collections = await Art.getColletionsOfArt(all_art_ids);
				let art_vibes = await Art_vibe.getAllArtsVibes(all_art_ids)
				//getting pinned counts for arts
				let pinned_art_counts = await User_pinned_art.getPinnedCounts(all_art_ids);
				//getting pinned counts for artist_collections
				let pinned_art_collections_counts = await User_pinned_art.getPinnedCounts(_.map(_.map(art_collections,"collection"),"id"),"artist_collection_id");
				for (art of arts) {
					art.template = Art.getTemplate(art.template)
					if (art.weight) {
						art.weight = parseFloat(art.weight).toFixed(2)
					}
					art.is_my_post = art.artist_id == user.user_id;
					art.is_pinned = pinned_art_ids.includes(art.id)
					art.is_pin_privacy_public = false;										
					art.pin_like_count = getPinCountArt(pinned_art_counts,art.id)
					if (art.is_pinned == true) {
						//now checking pin privacy of the art for logged in user
						art.is_pin_privacy_public = _.find(pinned_items.pinned_arts, { art: art.id })
						if (art.is_pin_privacy_public) {
							art.is_pin_privacy_public = art.is_pin_privacy_public.is_public
						}
					}
					art.vibes = await Art_vibe.getArtVibes(art_vibes,art.id)
					art.resources = _.filter(all_resources, function (o) {
						return o.art == art.id;
					});
					art.sizes = _.filter(all_sizes, function (o) {
						if (o.weight) {
							o.weight = parseFloat(o.weight).toFixed(2)
						}
						o.template = Art.getTemplate(o.template)
						return o.art == art.id;
					});
					// if (art.sizes.length) {
					//   art.sizes = _.map(art.sizes, "size");
					//  }
					art.collection = _.find(art_collections, { art: art.id })
					if (art.collection) {
						art.collection = art.collection.collection
						art.collection.is_my_collection = art.collection.user_id == user.user_id
						art.collection.is_pinned = artist_collection_ids.includes(art.collection.id)
						art.collection.is_pin_privacy_public = false;
						if (art.collection.is_pinned == true) {
							//now checking pin privacy of the artist collection for logged in user
							art.collection.is_pin_privacy_public = _.find(pinned_items.pinned_arts, { artist_collection: art.collection.id })
							if (art.collection.is_pin_privacy_public) {
								art.collection.is_pin_privacy_public = art.collection.is_pin_privacy_public.is_public
							}
						}		
						art.collection.pin_like_count = getPinCountArtistCollection(pinned_art_collections_counts,art.collection.id)
						delete art.collection.user_id

						art.has_collection = true
					}
					art.artist = {
						id: art.artist_id,
						image: art.image,
						cover_image: art.cover_image,
						profile_name: art.profile_name,
						profile_tag_id: art.profile_tag_id,
					};
					delete art.artist_id;
					delete art.image;
					delete art.cover_image;
					delete art.profile_name;
					delete art.profile_tag_id;
				}
			}
			return arts;
		} catch (err) {
			sails.log.error(`Error in Arts.getArts. ${err}`);
			return [];
		}
	},

	getTemplate: function (template) {
		try {
			if (template) {
				template = JSON.parse(template)
				parcel_template = sails.config.parcel_templates[template.token]
				if (parcel_template && !_.isEmpty(parcel_template)) {
				  template = { ...template,...parcel_template }
				}
			}
		} catch (err) {
			sails.log.error(`Error in Art.getTemplate. ${err}`);
		}
		
		return template
	},
	getColletionsOfArt: async function (art_ids) {
		let collections = [];
		try {
			let art_collections = await Art_collection.find({ art: art_ids }).populate("collection");
			if (art_collections.length) {
				collections = art_collections
				// collections = _.map(art_collections, "art");
			}
		} catch (err) {
			sails.log.error(`Error in Model Art, Function getColletionsOfArt. ${err}`)
		}	
		return collections
	},
	getRelatedSuggesstions: async function (
		user,
		art_id,
		offset = 0,
		limit = 9,
		select = []
	) {
    try {     
		let where = `a."deletedAt" is null AND a.id != ${art_id} AND sellable = true AND type = '${global.ART_TYPE.DEFAULT}'`;
		
		let exclude_ids = await Artist_collection.getCollectionArtIds(null, get = "private");
		if (exclude_ids.length) {
			where += ` and a.id not in(${exclude_ids.length})`
		}

      let art = await Art.findOne({ where: { id: art_id }, select: ["artist_id","price"] }).populate('sizes');
      let price = art.price
      if (!price && art.sizes.length) {
        price = _.map(art.sizes, "price")
        price  = price[0]
      }
      price = parseFloat(price)
      let percentage = 20
      let min_price = price - price*percentage/100
		let max_price = price + price * percentage / 100
		if (min_price && max_price) {
			where +=` and ((a.price >= ${min_price} and a.price <= ${max_price}) or (s.price >= ${min_price} and s.price <= ${max_price}))`
		}
      
      let art_vibes = await Art_vibe.find({
        where: { art: art_id },
        select: ["vibe"],
      });
      let or = ""
      if (art_vibes.length) {
        vibe_ids = _.map(art_vibes, "vibe")
        or = ` and (av.vibe_id in (${vibe_ids.toString()})`
      }
      or +=` or a.artist_id = '${art.artist_id}')`
      where += or;
      let order_by = ` ORDER BY a.id DESC OFFSET ${offset} LIMIT ${limit}`
			let query = `
      select distinct a.id,a.title,a.thumbnail
      from arts a
      left join art_vibes av
        on av.art_id = a.id
      left join art_sizes s
        on s.art_id = a.id
      where ${where} ${order_by}`			
      
     sails.log(query)
      let result = await sails.sendNativeQuery(query)
      
      let arts = result.rows     
      return arts;
    } catch (err) {
      sails.log.error(`Error in Model Art, Function getRelatedSuggesstions. ${err}`)
    }

	},

	updateQuantity: async function (arts) {
		try {
			for (art of arts) {
				let existing_art = await Art.findOne({
					where: { id: art.art_id },
					select: ["max_quantity","title","artist_id","thumbnail"],
				});
				let max_quantity = existing_art.max_quantity - art.quantity
				let quantity = null
				await Art.updateOne({ id: existing_art.id }).set({
					max_quantity,
				});
				let exist = await Art_size.findOne({ art: art.art_id, size: art.size });
				if (exist) {
					quantity = exist.quantity - art.quantity
					await Art_size.updateOne({ id: exist.id }).set({
						quantity: quantity,
					});
				}
				if (max_quantity <= 0 || (quantity != null && quantity <= 0)) {
					// send push notification of items sold
					
					await sails.helpers.notifications.sendAndSave(sails.config.notification.type.art_soldout,{art:existing_art});   
				}
			}
		} catch (err) {
			sails.log(`Error in Model Art function updateQuantity. ${err} `);
		}
	},
	updateArt: async function (obj,user) {
		try {
			await sails
				.getDatastore()
				.transaction(async (db) => { 
					
					if (!_.isUndefined(obj.vibes) && obj.vibes.length) {
						await Art_vibe.destroy({art:obj.id})
						vibes = obj.vibes.map((v) => {
						  return {
							art: obj.id,
							vibe: v,
						  };
						});
						let art_vibes = await Art_vibe.createEach(vibes).fetch();
					  }
					  await Art_size.destroy({art:obj.id})
					if (!_.isUndefined(obj.sizes) && obj.sizes.length) {
						obj.price = null
						obj.template = null
						obj.weight = null
						obj.mass_unit = null
						
						sizes = obj.sizes.map((r) => {	
							if (r.template) {
								r.template = JSON.stringify(r.template)	
							}							
							delete r.id
						  r.art = obj.id;
						  return r;
						});
						let art_sizes = await Art_size.createEach(sizes).fetch();
					}
					await Art_collection.destroy({art:obj.id})
					if (!_.isUndefined(obj.collections) && obj.collections.length) {						
						collections = obj.collections.map((c) => {
						  return {
							art: obj.id,
							collection: c,
						  };
						});
						let art_collection = await Art_collection.createEach(
						  collections
						).fetch();
					}
					delete obj.vibes;					
					delete obj.sizes;
					delete obj.collections;
					if (obj.template) {
						obj.template = JSON.stringify(obj.template)
					}
					let art = await Art.updateOne({ id: obj.id }).set(obj)
					if (art) {    
						if (obj.type == global.ART_TYPE.DROP) {
							//attach this art with artist's community
							let community = await Community.getArtistCommunity(user)
							if (community) {
							  await Community_art.createOrUpdateCommunityArt(community.id, art.id);
							}
						}
						else {
							await Community_art.RemoveArtFromCommunity(art.id)
						}
					}					

				})
			return true
		} catch (err) {
			sails.log(`Error in Model Art function updateArt. ${err} `);
			return false
		}
	},
	getArtIds: async function (artist_ids = []) {
		let data = [];
		try {
			let where = { id: { "!=":null} };
			if (artist_ids.length) {
				where.artist_id = artist_ids
			}
			let find = { where };
			find.select = ['id'];
			let arts = await Art.find(find);
			data = arts.length ? _.map(arts, "id") : [];
		} catch (err) {
			sails.log(`Error in Model Art function getArtIds. ${err} `);
		}
		
		return data;
	},
	searchArts: async function (where, offset = 0, limit = 1000) {		
		let arts = [];

		try {
			arts = await Art.find(where).skip(offset).limit(limit).sort("createdAt DESC");
			if (arts.length) {
				let artists = await User.find({
					where: { user_id: _.map(arts, "artist_id") },
					select: ["user_id", "username"],
				});
				//getting pinned counts for arts
				let pinned_art_counts = await User_pinned_art.getPinnedCounts(_.map(arts, "id"));				
				for (art of arts) {
					art.pin_like_count = getPinCountArt(pinned_art_counts,art.id)
					art.artist = _.find(artists, { user_id: art.artist_id });
					// art.artist.id = art.artist.user_id
					// delete art.artist.user_id
				}
			}
			
		} catch (err) {
			sails.log.error(`Error in model Art, function getArtsWithCustomSorting. ${err}`);
		}
		return arts;
	},
	searchOrderArtIdsByArtist: async function (search_text) {		
		let data	 = [];

		try {
			let query = `
			select oa.art_id
			from order_arts oa
			inner join arts a
			on a.id = oa.art_id
			inner join users u
			on u.user_id = a.artist_id
			where u.username like '%${search_text}%'
			`
			let result = await sails.sendNativeQuery(query)
			if (result.rows.length) {
				data = _.map(result.rows,"art_id")
			}
		} catch (err) {
			sails.log.error(`Error in model Art, function searchArtIdsByArtist. ${err}`);
		}
		return data;
	},
	searchOrderArtIdsByUser: async function (search_text) {		
		let data	 = [];

		try {
			let query = `
			select oa.art_id
			from order_arts oa
			inner join orders o
			on o.id = oa.order_id
			inner join users u
			on u.user_id = o.user_id
			where u.username like '%${search_text}%'
			`
			let result = await sails.sendNativeQuery(query)
			if (result.rows.length) {
				data = _.map(result.rows,"art_id")
			}
		} catch (err) {
			sails.log.error(`Error in model Art, function searchOrderArtIdsByUser. ${err}`);
		}
		return data;
	},
	countArts: async function (artist_id) {		
		let data	 = 0;

		try {
			data = await Art.count({
				artist_id,
				deletedAt: null,
				type:global.ART_TYPE.DEFAULT
			})			
		} catch (err) {
			sails.log.error(`Error in model Art, function countArts. ${err}`);
		}
		return data;
	},
};
