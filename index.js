const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
// const cookieParser = require("cookie-parser");

//import route
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const adminRoute = require("./routes/admin");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");

dotenv.config();

//connect DB
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("connected to Database")
);

//Middleware
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: "*",
  })
);
// app.use(cookieParser());

// app.get("*", checkUser);

app.get("/", (req, res) => {
  res.send("api running");
});

//Router Middlewares
app.use("/api/user", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/admindashboard", adminRoute);
app.use("/api/product", productRoute);
app.use("/api/order", orderRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server running in port ${port}`));
