// check current user
const User = require("../model/User");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("auth-token");
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(401).send("failed to verify token");
      } else {
        let user = await User.findById(decodedToken._id);
        if (user && user.isAdmin) {
          next();
        } else {
          return res.status(401).send("not Authorized");
        }
      }
    });
  } else {
    return res.status(401).send("not token");
  }
};
