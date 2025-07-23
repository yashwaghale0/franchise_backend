const dotenv = require("dotenv");
require("dotenv").config();


module.exports = configs = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT,
    IMAGE_BASE_URL: process.env.IMAGE_BASE_URL
}

