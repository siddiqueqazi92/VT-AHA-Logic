/**
 * isLoggedIn
 *
 * @module :: Policy
 * @description :: Checks that user is logged in and adds user to input
 * @docs :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

 module.exports = async (req, res, next) => {
  let user = req.query.user;
  sails.log.debug(
    `policy isArtist user_id: ${user.id} path: ${req.path}`
  );
   let user2 = await User.findOne({ where: { user_id: user.id }, select:["is_artist"] })
  if (!_.isUndefined(user2) && user2.is_artist == true) {
    return next();
  }
  sails.log.warn(
    `User must be an artist. user_id ${user.id}`
  );
  return res.ok({
    status: false,
    message:"Must be an artist to perform this action",
    data: [],
  });
};
