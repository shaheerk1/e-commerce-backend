const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");
const verify = require("../middleware/verifyToken");

router.post("/register", async (req, res) => {
  //validating
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check if email already exist
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email is taken");

  //hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //create user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  //validating
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check if email is valid
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email or password is wrong");

  //password check
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  //CREATE AND ASIGN JWT TOKEN
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.header("auth-token", token).send(token);
});

router.get("/userdata", verify, (req, res) => {
  const token = req.header("auth-token");

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        res.status(401).send("failed to verify token");
      } else {
        let user = await User.findById(decodedToken._id);
        if (user) {
          const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            accCreated: user.date,
          };

          res.status(200).json(userData);
        } else {
          res.status(401).send("not Authorized");
        }
      }
    });
  } else {
    return res.status(401).send("not token");
  }
});

module.exports = router;
