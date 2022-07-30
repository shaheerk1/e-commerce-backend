const router = require("express").Router();
const verify = require("../middleware/verifyToken");

router.get("/", verify, (req, res) => {
  res.json({
    posts: {
      title: "my first post",
      description: "some randdom description coming right here",
    },
  });
});

module.exports = router;
