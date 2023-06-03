const Router = require('express')
const companyRouter = new Router()
const companyController = require('../controllers/company.controller')
const multer = require("multer");
const auth = require('../authMiddleWare')

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./company_logo_storage");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },
});

const tripPhotoStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./trip_photo_storage");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },
});


const upload = multer({ storage: fileStorageEngine });
const uploadPhoto = multer({storage: tripPhotoStorageEngine})

companyRouter.post('/sign-up',upload.single("image"), companyController.registerCompany);
companyRouter.post('/log-in', companyController.logInCompany)
companyRouter.post('/add-trip',auth, uploadPhoto.single("image"), companyController.addTrip)
companyRouter.get('/logged-company-page-avatar', auth, companyController.sendCompanyImage)
companyRouter.get('/review-trip', auth, companyController.getAllCompanyTrips)
companyRouter.post('/trip-image', companyController.sendTripImage)
companyRouter.post('/get-user-trips', companyController.sendUserTrips)
companyRouter.post('/delete-trip',auth, companyController.deleteTrip)
companyRouter.post('/edit-trip', companyController.editTripData)

module.exports = companyRouter