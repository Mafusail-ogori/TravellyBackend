const Router = require('express')
const router = new Router()
const companyController = require('../')
const multer = require("multer");
const userController = require("../controllers/user.controller");

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./company_logo_storage");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },
});

const upload = multer({ storage: fileStorageEngine });

router.post('/create-company',upload.single("image"), companyController.registerCompany);