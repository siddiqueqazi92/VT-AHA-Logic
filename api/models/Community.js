/**
 * Community.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "default",
  tableName: "communities",
  primaryKey: "id",
  attributes: {
    artist_id: {
      type: "string",
      required: true,
    },
    name: {
      type: "string",
      required: true,
    },
    image: {
      type: "string",
      required: false,
      defaultsTo: "https://ahauserposts.s3.amazonaws.com/icon.png",
    },
    facebook: {
			type: "string",
			required: false,
      allowNull:true
		},
		instagram: {
			type: "string",
			required: false,
      allowNull:true
		},
		tiktok: {
			type: "string",
			required: false,
      allowNull:true
		},
		dribble: {
			type: "string",
			required: false,
      allowNull:true
		},
  },
  getAhaCommunity: async function () {
    try {
      let aha_artist = await User.find({ where: { username: 'aha' }, select: ['user_id', "username"] });
      if (!aha_artist.length) {
        return null
      }
      aha_artist = aha_artist[0];
      let community = await Community.find({ artist_id: aha_artist.user_id }).limit(1);
      if (!community.length) {
        let community_name = await sails.helpers.getCommunityName(aha_artist.user_id, aha_artist.username+"'s Community")
        await Community.createOrUpdateCommunity(aha_artist.user_id, community_name)
        community = await Community.find({ artist_id: aha_artist.user_id }).limit(1);
      }      
      return community[0]
    } catch (err) {
      sails.log.error(`Error in model Community, function getAhaCommunity. ${err}`);
      return null
    }
   
    
  },
  getArtistCommunity: async function (user) {
    try {
      let community = await Community.find({ artist_id: user.id }).limit(1);
      if (!community.length) {
        let community_name = await sails.helpers.getCommunityName(user.id, user.username+"'s Community")
        await Community.createOrUpdateCommunity(user.id, community_name, user.profile_image || null)
        community = await Community.find({ artist_id: user.id }).limit(1);
      }      
      return community[0]
    } catch (err) {
      sails.log.error(`Error in model Community, function getArtistCommunity. ${err}`);
      return null
    }
   
    
  },
  createOrUpdateCommunity: async function (artist_id, name = null,image = null) {

    let obj = { artist_id }
    if (name) {
      obj.name = name
    }
    if (image) {
      obj.image = image
    }
    try {
      await Community.updateOrCreate({ artist_id }, obj);
      return true
    } catch (err) {
      sails.log.error(`Error in model Community, function createOrUpdateCommunity. ${err}`)
      return false
    }WW
   
  },
  getFollowingCommunities: async function(inputs) {
    let data = [];
    let where = `cf.follower_id ='${inputs.user_id}'`
    if (inputs.search_text) {
      where += ` AND c.name like '%${inputs.search_text}%'`
    }
    let query = `
    select  distinct c.*,ca.id as ca_id,cf.id as cf_id
    from communities c
    left join community_arts ca
      on ca.community_id = c.id
    inner join community_followers cf
      on cf.community_id = c.id

    where ${where}
    group by c.id,ca.id,cf.id
    order by cf.id DESC
    OFFSET ${inputs.offset} LIMIT ${inputs.limit}
    `
    sails.log(query);
    try {
      
      let result = await sails.sendNativeQuery(query);
      if (result.rows.length) {    
        data = result.rows    
        data = _.unique(data, function (e) {
          return e.id;
        });

      }
      where = `cf.follower_id ='${inputs.user_id}'`
      if (inputs.search_text) {
        where += ` AND c.name like '%${inputs.search_text}%'`
      }
      let remaining_limit = inputs.limit;
      if (data.length) {
        where += ` AND c.id NOT IN(${_.map(data, "id")})`
        remaining_limit = data.length > inputs.limit?data.length-inputs.limit:inputs.limit-data.length
        
      }
    
      if (remaining_limit) {
        query = `
        select  distinct c.*,cf.id as cf_id
        from communities c    
        inner join community_followers cf
          on cf.community_id = c.id
  
        where ${where}     
        
        order by cf.id DESC
        OFFSET ${inputs.offset} LIMIT ${remaining_limit}
        `
        sails.log(query);
        result = await sails.sendNativeQuery(query);
        if (result.rows.length) {        
          data = _.union(data,result.rows)
  
        }
      }
     
    } catch (err) {
      sails.log.error(`Error in model Community, function getFollowingCommunities. ${err}`)
      
    }
    return data
  },
  getFollowingCommunitiesDrops: async function(filter = {user_id:null,offset:0,limit:10}) {
    let data = [];
    let where = `a."deletedAt" is null`
    if (filter.user_id) {
      where += ` AND cf.follower_id ='${filter.user_id}'`
    }
    let query = `
    select distinct on(a.id,ca.id) 
    a.id,a.type,a.title,a.thumbnail,r.type as resource_type,r.uri 
    from arts a
    inner join community_arts ca
    on ca.art_id = a.id
    inner join community_followers cf
    on cf.community_id = ca.community_id
	  left join LATERAL(select ar.* from art_resources ar where ar.art_id = a.id limit 1) r on 1=1
    where ${where}
    order by ca.id desc
    offset ${filter.offset} limit ${filter.limit}    
    `
    sails.log(query);
    try {
      
      let result = await sails.sendNativeQuery(query);
      data = result.rows                
    } catch (err) {
      sails.log.error(`Error in model Community, function getFollowingCommunitiesDrops. ${err}`)
      
    }
    return data
  },
  addUserInAhaCommunity: async function (user_id) {    
    try {
      let aha_community = await Community.getAhaCommunity();
      await Community_follower.addFollower(
        user_id,[aha_community.id]        
      );		
		} catch (err) {
			sails.log.error(
				`Error in model Community, function: addUserInAhaCommunity. ${err}`
			);
		}
  },
  addArtInAhaCommunity: async function (art_id) {    
    try {
      let aha_community = await Community.getAhaCommunity();
      await Community_art.createOrUpdateCommunityArt(aha_community.id, art_id);	
		} catch (err) {
			sails.log.error(
				`Error in model Community, function: addUserInAhaCommunity. ${err}`
			);
		}
  },
  getFollowerCounts: async function (community_ids = []) {		
		let data = []
		try {
		let where = `community_id is not NULL`
		if (community_ids.length) {			
			where += ` AND community_id IN (${community_ids.toString()})`
		}
		let query = `
		SELECT COUNT(*) AS total,community_id
		FROM community_followers		
		WHERE ${where}
		GROUP BY community_id`;
		sails.log(query)
		let result = await sails.sendNativeQuery(query);
		data = result.rows
		} catch (err) {
			sails.log(`Error in Model Community, function getFollowingCounts. ${err} `);
		}
		
		return data;
	},
};
