const auth = require("../middleware/auth");
const autor = require("../middleware/autor");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user.model");
const express = require("express");
const router = express.Router();

router.get("/current", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.get("/autor", async (req, res) => {
  const user = await User.findOne({
    name: req.body.name,
    // password: await bcrypt.hash(req.body.password, 10),
    email: req.body.email
  });
  
  bcrypt.compare(req.body.password, user.password)
    .then(res => {
      console.log(res, 'res')
    })
  
  console.log(user);
  
  const token = user.generateAuthToken();
  res.header('x-auth-token', token)
    .send({
      _id: user._id,
      name: user.name,
      email: user.email
    });
  
  console.log(token, 'token')
  
  // res.send(user);
});

// router.get('/', (req, res) => {
//   // res.sendFile('index.html' , { root : __dirname});
//   res.render('index')
// });

router.post("/", async (req, res) => {
  // validate the request body first
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  //find an existing user
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");
  
  user = new User({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email
  });
  
  user.password = await bcrypt.hash(user.password, 10);
  await user.save();
  
  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send({
    _id: user._id,
    name: user.name,
    email: user.email
  });
});

module.exports = router;
