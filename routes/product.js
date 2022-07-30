const router = require("express").Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../model/Product");
const verify = require("../middleware/verifyToken");
const checkAdmin = require("../middleware/checkAdmin");

router.post(
  "/upload",
  verify,
  checkAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      // Create new user
      let product = new Product({
        name: req.body.name,
        description: req.body.description,
        imageUrl: result.secure_url,
        cloudinary_id: result.public_id,
        user: req.body.user,
        brand: req.body.brand,
        category: req.body.category,
        price: req.body.price,
        countInStock: req.body.countInStock,
      });
      // Save user
      await product.save();
      res.json(product);
    } catch (err) {
      console.log(err);
    }
  }
);

router.get("/", async (req, res) => {
  let products = await Product.find();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(401).send("no products");
  }
});

router.delete("/delete/:id", verify, checkAdmin, async (req, res) => {
  try {
    // Find product by id
    let product = await Product.findById(req.params.id);
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(product.cloudinary_id);
    // Delete user from db
    await product.remove();
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Find product by id
    let product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(404).send("no product found");
  }
});

module.exports = router;
