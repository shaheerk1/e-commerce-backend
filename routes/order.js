const router = require("express").Router();
const Order = require("../model/Order");
const verify = require("../middleware/verifyToken");
const Product = require("../model/Product");
const jwt = require("jsonwebtoken");
const checkAdmin = require("../middleware/checkAdmin");

router.post("/create", verify, async (req, res) => {
  try {
    let testOrder = req.body;
    const { user, orderItems, shippingAddress } = req.body;

    let totPrice = 0;

    let orderItemArray = [];

    const finishedMap = orderItems.map(async (item) => {
      let itemData = await Product.findById(item.itemId);
      if (itemData) {
        let itemDataForArray = {
          name: await itemData.name,
          qty: item.qty,
          image: await itemData.imageUrl,
          price: await itemData.price,
          product: item.itemId,
        };

        orderItemArray.push(itemDataForArray);
      }
    });

    await Promise.all(finishedMap);

    const totalPrc = orderItemArray.map((item) => {
      totPrice = totPrice + item.price * item.qty;
    });
    await Promise.all(totalPrc);

    let dbOrder = {
      user: user,
      orderItems: orderItemArray,
      shippingAddress: {
        name: shippingAddress.name,
        mobile: shippingAddress.mobile,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        state: shippingAddress.state,
        country: shippingAddress.country,
      },
      totalPrice: totPrice,
    };

    let order = new Order(dbOrder);
    await order.save();

    res.json(order);

    // // Create new user
    // let order = new Order({
    //   name: req.body.name,
    // });
    // // Save user
    // await order.save();
    // res.json(order);
  } catch (err) {
    res.json(err);
    console.log(err);
  }
});

router.get("/myorders", verify, (req, res) => {
  const token = req.header("auth-token");

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        res.status(401).send("failed to verify token");
      } else {
        let orders = await Order.find({ user: decodedToken._id });
        if (orders) {
          res.status(200).json(orders);
        } else {
          res.status(401).send("not Authorized");
        }
      }
    });
  } else {
    return res.status(401).send("no token");
  }
});
router.get("/allorders", verify, checkAdmin, async (req, res) => {
  let allorders = await Order.find();
  if (allorders) {
    res.status(200).json(allorders);
  } else {
    res.status(401).json("no orders");
  }
});

router.get("/:id", verify, checkAdmin, async (req, res) => {
  try {
    // Find order by id
    let order = await Order.findById(req.params.id);
    res.status(200).json(order);
  } catch (err) {
    res.status(404).send("no order found");
  }
});

module.exports = router;
