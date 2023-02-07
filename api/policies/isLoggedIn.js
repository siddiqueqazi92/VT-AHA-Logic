/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Checks that user is logged in and adds user to input
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = async (req, res, next) => {
	// User is allowed, proceed to the next policy,
	// or if this is the last policy, the controller
	// return res.ok({ status: false, data: _.map(await User.find(), "username") });
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token === null) {
		return res.forbidden();
	}
	try {
		let user = await sails.helpers.jwt.verifyToken.with({ token });
		if (!user) {
			return res.unauthorized({
				status: false,
				message: "Unauthorized.",
			});
		}
		let current_route = req.path.split("/");
		current_route = current_route[current_route.length - 1];
		let allowed_routes = ["personal-info","social-login"];
		let extra_attributes = null;
		if (!allowed_routes.includes(current_route)) {
			extra_attributes = await User.findOne({
				where: { user_id: user.id },
				select: [
					"customer_id",
					"username",
					"name",
					"country",
					"is_active",
					"wallet",
					"stripe_account_id",
					"pending_amount",
					"available_amount",
					"total_amount",
					"withdrawal_requested",
					"is_artist",
					"login_type",
					"role"
				],
			});
			if (!extra_attributes) {
				return res.forbidden({
					status: false,
					message: "Your account has been deleted.",
				});
			}
		}

		if (extra_attributes) {
			extra_attributes.available_amount = parseFloat(extra_attributes.available_amount);
			if (extra_attributes.wallet) {
				extra_attributes.wallet = parseFloat(extra_attributes.wallet);
			}
			if (extra_attributes.is_active == false) {
				return res.forbidden();
			}
			delete extra_attributes.id;
			user = _.merge(user, extra_attributes);
			if (!extra_attributes.country && extra_attributes.login_type == 'simple') {
				await sails.helpers.attachCountry(user.id, user.contact.country_code);
			}
		}
		sails.log.debug(`policy isLoggedIn user_id: ${user.id} path: ${req.path}`);
		// if (req.method == "GET") {
		//   req.query.user = user;
		// } else {
		//   req.body.user = user;
		// }
		req.query.user = user;
		return next();
	} catch (e) {
		sails.log.error(e);
		return res.forbidden();
	}

	// return res.unauthorized();
};
