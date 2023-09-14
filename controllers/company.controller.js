const database = require('../database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {secret} = require('../config')
const path = require("path");
const nodemailer = require('nodemailer')

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

const generateAccessToken = async (id, login) => {
    const payload = {
        id,
        login
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'})
}

const getCompany = async (login) => {
    const company = await database.query(`SELECT * FROM companyinfo WHERE company_name = '${login}' 
or company_mail = '${login}'`)
    return company.rows[0];
}

const checkTrip = async (name) => {
    const tripCount = await database.query(`SELECT COUNT (trip_id) FROM trip WHERE 
trip_name = '${name}'`)
    return +tripCount.rows[0].count > 0
}

const addTrip = async (name, amount, animal, transfer, food, hotel, startCountry, endCountry, startDate, endDate, image,
                       price, companyId, description) => {
    await database.query(`INSERT INTO trip (trip_name, trip_people_amount, trip_pets, trip_transfer, trip_food, trip_hotel, trip_start_country, 
trip_destination_country, trip_start_date, trip_end_date, trip_image, trip_price, company_id, trip_description)
VALUES ('${name}', '${amount}', '${animal}', '${transfer}', '${food}', '${hotel}','${startCountry}', 
'${endCountry}', '${startDate}','${endDate}','${image}','${price}', '${companyId}', '${description}')`)
}

const editTripData = async (name, amount, animal, transfer, food, hotel, startCountry, endCountry, startDate, endDate,
                            price, description, tripId) => {
    await database.query(`UPDATE trip SET trip_name = '${name}', trip_people_amount = '${amount}' , trip_pets = '${animal}', 
trip_transfer = '${transfer}', trip_food = '${food}', trip_hotel = '${hotel}', trip_start_country = '${startCountry}',
trip_destination_country = '${endCountry}',trip_start_date = '${startDate}', trip_end_date = '${endDate}', trip_price = '${price}',
trip_description = '${description}' WHERE trip_id = '${tripId}'`)
    const userMail = await database.query(`select user_mail from trip join 
user_choice on ${tripId} = trip.trip_id join userinfo on user_choice.user_id = userinfo.user_id`)
    if(userMail.rows[0].user_mail.includes('@')){
        const transporter = nodemailer.createTransport({
            service: 'Outlook',
            auth: {
                user: '******',
                pass: '*******'
            }
        })
        const mailOptions = {
            from: '******',
            to: userMail.rows[0].user_mail,
            subject: 'Зміни в путівці',
            text: 'В путівці, що ви обрали відбулись зміни, будь ласка перегляньте їх на сайті, з повагою команда Travelly!'
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error){
                console.log(error)
            }
            else{
                console.log('ПОВІДОМЛЕННЯ НАДІСЛАНЕ: ', info.response)
            }
        })
    }
}

const checkForDate = async (name, startDate, endDate) => {
    const trip = await database.query(`SELECT * FROM trip WHERE trip_name = '${name}'`)
    console.log(startDate, endDate, trip.rows[0].trip_start_date, trip.rows[0].trip_end_date)
    return (trip.rows[0].trip_start_date >= startDate && trip.rows[0].trip_start_date <= endDate) ||
        (trip.rows[0].trip_end_date >= startDate && trip.rows[0].trip_end_date <= endDate) ||
        (trip.rows[0].trip_start_date <= startDate && trip.rows[0].trip_end_date >= endDate);
}

const getAllTrips = async (companyId) => {
    const trips = await database.query(`SELECT * FROM trip WHERE company_id = ${companyId}`)
    return trips.rows
}

const getTrip = async (tripId) => {
    const trip = await database.query(`SELECT * FROM trip WHERE trip_id = ${tripId}`)
    return trip.rows[0]
}

const getAllUserTrips = async (country) => {
    const trips = await database.query(`SELECT * FROM trip WHERE trip_destination_country = '${country}'`)
    return trips.rows
}

const deleteSelectedTrip = async (companyId, tripId) => {
    return database.query(`DELETE FROM trip WHERE company_id = ${companyId} and trip_id = ${tripId}`)
}

const getCompanyProfit = async(companyId) => {
    console.log(companyId)
    const incomeData = await database.query(`SELECT operation_date, amount FROM operations WHERE company_id = ${companyId}`)
    return incomeData.rows
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

    async sendCompanyImage(req, res) {
        try {
            const companyData = await getCompany(req.user.login)
            const filepath = path.join(__dirname, '../', 'company_logo_storage', companyData.company_logo)
            res.sendFile(filepath)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "File sending error"})
        }
    }

    async addTrip(req, res) {
        try {
            const data = req.file.filename
            const allData = req.body
            if (await checkTrip(allData.name) && await checkForDate(allData.name, allData.startDate.slice(0, 10), allData.endDate.slice(0, 10))) {
                return res.status(400).json({message: "There is such an trip for this dates"})
            }
            await addTrip(allData.name, allData.amount, allData.animal,
                allData.transfer, allData.food, allData.hotel,
                allData.startCountry, allData.endCountry, allData.startDate.slice(0, 10), allData.endDate.slice(0, 10), data, allData.price, req.user.id, allData.description)
            return res.status(200).json({message: "Trip added successfully"})
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Adding trip failure"})
        }
    }

    async getAllCompanyTrips(req, res) {
        try {
            res.send(await getAllTrips(req.user.id))
        } catch (e) {
            console.log(e)
            res.status(400).json({message: "Data sending error"})
        }
    }

    async sendTripImage(req, res) {
        try {
            const {id} = req.body
            const trip = await getTrip(id)
            const filepath = path.join(__dirname, '../', 'trip_photo_storage', trip.trip_image)
            res.status(200).sendFile(filepath)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Sending image error"})
        }
    }

    async sendUserTrips(req, res) {
        try {
            const {country} = req.body
            const trips = await getAllUserTrips(country)
            res.send(trips)
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'no trips'})
        }
    }

    async deleteTrip(req, res) {
        try {
            await deleteSelectedTrip(req.user.id, req.body.tripId)
            res.send(200).json({message: 'success'})
        } catch (e) {

        }
    }

    async editTripData(req, res) {
        try {
            const allData = req.body;
            await editTripData(allData.name, allData.amount, allData.animal,
                allData.transfer, allData.food, allData.hotel,
                allData.startCountry, allData.endCountry, allData.startDate, allData.endDate, allData.price, allData.description, allData.tripId)
            res.status(200).json({message: 'edited successfully'})
        } catch (e) {
            console.log(e)
        }
    }

    async getProfit(req, res){
        try{
            return res.status(200).send(await getCompanyProfit(req.user.id))
        }catch (e) {
            console.log(e)
            res.status(400).json({message: 'Sending error'})
        }
    }
}

module.exports = new CompanyController()
