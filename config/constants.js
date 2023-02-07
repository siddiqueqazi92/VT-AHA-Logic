module.exports.notification = {
	type: {		
		user_followed_you: "user_followed_you",
		order_placed: "order_placed",
		order_status_changed: "order_status_changed",
		comment_on_art: "comment_on_art",
		like_on_comment: "like_on_comment",
		art_was_pinned: "art_was_pinned",
		art_soldout: "art_soldout",
		payment_expired: "payment_expired",

	},
};
module.exports.parcel_templates = {
USPS_FlatRateCardboardEnvelope: { length:12.50, width:9.50, height:0.75, distance_unit:'in' } ,
USPS_FlatRateEnvelope: {length:12.50, width:9.50, height:0.75, distance_unit:'in'},
USPS_FlatRateGiftCardEnvelope: {length:10.00, width:7.00, height: 0.75, distance_unit:'in'},
USPS_FlatRateLegalEnvelope: { length: 15.00, width:9.50, height:0.75, distance_unit:'in'},
USPS_FlatRatePaddedEnvelope: {length:12.50, width: 9.50, height:1.00, distance_unit:'in'},
USPS_FlatRateWindowEnvelope: {length:10.00, width:5.00, height:0.75, distance_unit:'in'},
USPS_IrregularParcel: {length:0.00, width:0.00, height:0.00, distance_unit:'in'},
USPS_LargeFlatRateBoardGameBox: {length:24.06, width:11.88, height:3.13, distance_unit:'in'},
USPS_LargeFlatRateBox: {length:12.25, width:12.25, height:6.00, distance_unit:'in'},
USPS_APOFlatRateBox: {length:12.25, width:12.25, height:6.00, distance_unit:'in'},
USPS_LargeVideoFlatRateBox:{length:9.60, width:6.40, height:2.20, distance_unit:'in'},
USPS_MediumFlatRateBox1: {length:11.25, width:8.75, height:6.00, distance_unit:'in'},
USPS_MediumFlatRateBox2: {length:14.00, width:12.00, height:3.50, distance_unit:'in'},
USPS_RegionalRateBoxA1: {length:10.13, width:7.13, height:5.00, distance_unit:'in'},
USPS_RegionalRateBoxA2: {length:13.06, width:11.06, height:2.50, distance_unit:'in'},
USPS_RegionalRateBoxB1: {length:12.25, width:10.50, height:5.50, distance_unit:'in'},
USPS_RegionalRateBoxB2: {length:16.25, width:14.50, height:3.00, distance_unit:'in'},
USPS_SmallFlatRateBox: {length:8.69, width:5.44, height:1.75, distance_unit:'in'},
USPS_SmallFlatRateEnvelope: {length:10.00, width:6.00, height:4.00, distance_unit:'in'},
}
