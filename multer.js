const multer = require("multer");

//a function for uploading files with multer
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./upload");
    },
    filename: function (req, file, callback) {
        const pictureCode = Date.now() + "-" + Math.floor(Math.random() * 1e9);
        callback(null, pictureCode + "-" + file.originalname)
    }
});


const uploads = multer({
    storage: storage, limits: {
        fileSize: 1024 * 1024 * 5, //5mb
    },
})

module.exports = uploads;