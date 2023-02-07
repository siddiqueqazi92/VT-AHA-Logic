/**
 * isAdmin
 *
 * @module :: Policy
 * @description :: Checks that user is logged in and adds user to input
 * @docs :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

 module.exports = async (req, res, next) => {
  let user = req.query.user;
  sails.log.debug(
    `policy isAdmin user_id: ${user.id} path: ${req.path}`
  );
  
  if (!_.isUndefined(user) && user.role === global.ROLE.ADMIN) {
    return next();
  }
  sails.log.warn(
    `User must be an admin. user_id ${user.id}`
  );
  return res.ok({
    status: false,
    message:"Must be an admin to perform this action",
    data: [],
  });
};
