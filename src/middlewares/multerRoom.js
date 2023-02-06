const multer = require("multer")
// const test = require("../public/propertyPicture")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './src/public/roomPicture');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "L-IMG" +
        "-" +
        Date.now() +
        Math.round(Math.random() * 1000) +
        "." +
        file.mimetype.split("/")[1]
    );
  },
});

exports.roomUpload = multer({ storage });