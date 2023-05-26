const Router = require('express')
const companyRouter = new Router()
const companyController = require('../controllers/company.controller')
const multer = require("multer");

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./company_logo_storage");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },
});

const upload = multer({ storage: fileStorageEngine });

companyRouter.post('/create-company',upload.single("image"), companyController.registerCompany);

module.exports = companyRouter