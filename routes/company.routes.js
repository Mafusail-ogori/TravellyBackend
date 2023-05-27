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

const upload = multer({ storage: fileStorageEngine });

companyRouter.post('/sign-up',upload.single("image"), companyController.registerCompany);
companyRouter.post('/log-in', companyController.logInCompany)
companyRouter.get('/logged-company-page-avatar', auth, companyController.sendCompanyImage)

module.exports = companyRouter