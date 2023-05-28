const database = require('../database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {secret} = require('../config')
const path = require("path");

const validateCompany = async (login, mail) => {
    const companyCount = await database.query(`SELECT COUNT(company_id) FROM companyinfo WHERE
company_name = '${login}' or company_mail = '${mail}'`);
    console.log(+companyCount.rows[0].count)
    return +companyCount.rows[0].count > 0
}

const addCompany = async (name, image, date, email, employeeAmount, password) => {
    await database.query(`INSERT INTO companyinfo (company_name, company_logo, creation_date, 
company_mail, employee_amount, company_password) 
VALUES ('${name}', '${image}', '${date}','${email}','${employeeAmount}','${password}')`)
}

const validatePassword = async (login, password) => {
    const company = await database.query(`SELECT * FROM companyinfo WHERE company_name = '${login}' 
or company_mail = '${login}'`);
    return bcrypt.compareSync(password, company.rows[0].company_password)
}

const getCompany = async (login) => {
    const company = await database.query(`SELECT * FROM companyinfo WHERE company_name = '${login}' 
or company_mail = '${login}'`)
    return company.rows[0];
}

const addTrip = async (name, amount, animal, transfer, food, hotel, startCountry, endCountry, startDate, endDate, image, price) => {
    await database.query(`INSERT INTO trip (trip_name, trip_people_amount, trip_pets, trip_transfer, trip_food, trip_hotel, trip_start_country, 
trip_destination_country, trip_start_date, trip_end_date, trip_image, trip_price)
VALUES ('${name}', '${amount}', '${animal}', '${transfer}', '${food}', '${hotel}','${startCountry}', 
'${endCountry}', '${startDate}','${endDate}','${image}','${price}')`)
}

const generateAccessToken = async (id, login) => {
    const payload = {
        id,
        login
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'})
}

const checkTrip = async (name) => {
    const tripCount = await database.query(`SELECT COUNT (trip_id) FROM trip WHERE 
trip_name = '${name}'`)
    return +tripCount.rows[0].count > 0
}

const checkForDate = async (name, startDate, endDate) => {
    const trip = await database.query(`SELECT * FROM trip WHERE trip_name = '${name}'`)
    return (trip.rows[0].trip_start_date >= startDate && trip.rows[0].trip_start_date <= endDate) ||
        (trip.rows[0].trip_end_date >= startDate && trip.rows[0].trip_end_date <= endDate) ||
        (trip.rows[0].trip_start_date <= startDate && trip.rows[0].trip_end_date >= endDate);

}

class CompanyController {
    async registerCompany(req, res) {
        try {
            const data = req.file.filename
            const allData = req.body
            console.log(allData.name)
            if (await validateCompany(allData.name, allData.email)) {
                return res.status(400).json({message: 'Found same company'})
            }
            await addCompany(allData.name, data, allData.date, allData.email,
                allData.employeeAmount, bcrypt.hashSync(allData.password, 7))
            return res.status(200).json({message: 'Company added successfully'})
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Company register error'})
        }
    }

    async logInCompany(req, res) {
        try {
            const {login, password} = req.body
            if (!await validateCompany(login, password)) {
                return res.status(400).json({message: `Company with ${login} not found`})
            }
            if (!await validatePassword(login, password)) {
                return res.status(400).json({message: `Company with ${login} send not correct password`})
            }
            const company = await getCompany(login)
            const token = await generateAccessToken(company.company_id, company.company_name)
            return res.json({message: token})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Login error'})
        }
    }

    async sendCompanyImage(req, res){
        try{
            const companyData = await getCompany(req.user.login)
            const filepath = path.join(__dirname, '../', 'company_logo_storage', companyData.company_logo)
            res.sendFile(filepath)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "File sending error"})
        }
    }

    async addTrip(req, res){
        try{
            const data = req.file.filename
            const allData = req.body
            console.log(allData.food)
            if (await checkTrip(allData.name) && await checkForDate(allData.name, allData.startDate, allData.endDate)){
                return res.status(400).json({message: "There is such an trip for this dates"})
            }
            if (! await addTrip(allData.name, allData.amount, allData.animal,
                allData.transfer, allData.food, allData.hotel,
                allData.startCountry, allData.endCountry, allData.startDate, allData.endDate, data, allData.price)){
                return res.status(400).json({message: "Adding trip failure"})
            }
            return res.status(200).json({message: "Trip added successfully"})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Adding trip failure"})
        }
    }
}

module.exports = new CompanyController()