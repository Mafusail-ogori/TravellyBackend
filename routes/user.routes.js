const Router = require('express')
const userRouter = new Router()
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

userRouter.post('/sign-up',upload.single("image"), userController.registerUser);
userRouter.post('/log-in', userController.logInUser);
userRouter.get('/logged-user-page-avatar', auth, userController.sendUserImage)
userRouter.post('/user-choose-trip', auth, userController.addChoice)
userRouter.get('/user-cart-trips', auth, userController.getUserCart)

module.exports = userRouter