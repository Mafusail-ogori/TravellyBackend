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
userRouter.post('/delete-cart', auth, userController.deleteFromCart)
userRouter.get('/user-cart-trips', auth, userController.getUserCart)
userRouter.post('/payment', auth, userController.addPayment)

module.exports = userRouter