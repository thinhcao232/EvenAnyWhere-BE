const multer = require('multer');
const path = require('path');


const storageEvent = multer.diskStorage({
    destination: (req, file, cb) => {

        cb(null, path.join(__dirname, '../public/eventImage'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const uploadEventImages = multer({ storage: storageEvent }).array('images', 6);

module.exports = uploadEventImages;