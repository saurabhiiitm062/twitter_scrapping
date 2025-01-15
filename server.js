const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const trendsRouter = require("./routes/trendsRoutes");
require("dotenv").config();
require("./config/db"); // Import db connection (no need to call db())

const app = express();

// Static files from views/index.html
app.use(express.static(path.join(__dirname, "views")));

// Define routes
app.use("/", trendsRouter);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
