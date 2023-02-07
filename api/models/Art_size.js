/**
 * Art_size.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "art_sizes",
  attributes: {
    createdAt: false,
    updatedAt: false,
    art: {
      model: "art",
      required: true,
      columnName: "art_id",
    },
    size: {
      type: "string",
      required: true,
    },
    quantity: {
      type: "number",
    },
    price: {
      type: "number",
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
  },
  customToJSON: function () {
		if (this.template && !_.isEmpty(this.template) && !_.isObject(this.template) ){
			this.template = JSON.parse(this.template)
    }
    this.weight = this.weight > 0 ? parseFloat(this.weight).toFixed(2):0
		return _.omit(this,[]);
	},
};
