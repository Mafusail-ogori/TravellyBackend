const Router = require('express')
const router = new Router()
const userController = require('../controllers/user.controller')
const multer = require('multer')
const auth = require('../authMiddleWare')

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./storage");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },
});

const upload = multer({ storage: fileStorageEngine });

router.post('/sign-up',upload.single("image"), userController.registerUser);
router.post('/log-in', userController.logInUser);
router.get('/logged-user-page', auth, userController.sendUserData)

module.exports = router