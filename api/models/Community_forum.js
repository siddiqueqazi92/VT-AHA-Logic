/**
 * Community_forum.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "default",
	tableName: "community_forums",
	primaryKey: "id",
	attributes: {		
		community: {
			model: "community",
			columnName: "community_id",
		},
		title: {
			type: "string",
			required: true,
		},
		description: {
			type: "string",
			required: false,
			allowNull: true,
		},
		media_uri: {
			type: "string",
			required: false,
			allowNull: true,
		},
		media_type: {
			type: "string",
			required: false,
			allowNull: true,
		},
		
		thumbnail: {
			type: "string",
			required: false,
			allowNull: true,
		},
	},
};
