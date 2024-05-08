require("express-async-errors")
require("dotenv").config()
const express = require('express');
const app = express();
const port = process.env.PORT || 5001;
const connectDB = require('./db/connectDB');
const errorHandler = require("./middleware/errorHandler");
const { notFoundPage } = require("./middleware/notfoundpage");
const cooker_parser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const adminRouter = require("./routers/admin");
const footballRouter = require("./routers/football");
const writeUp = require("./routers/landing");

app.use(express.json());
app.use(cooker_parser());
app.use("/upload", express.static(path.join(__dirname, "upload")))
app.use(cors({
  credentials: true,
  origin: "http://localhost:5173"
}));


app.use('/api/v1/admin', adminRouter);
app.use("/api/v1/football", footballRouter);
app.use("/api/v1/landing", writeUp);

app.use(notFoundPage)
app.use(errorHandler);


async function starter() {
  try {
    const db = await connectDB();
    if (db) {
      console.log('connected to database successfully...');
    }
    app.listen(port, console.log(`app listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
}

starter();
