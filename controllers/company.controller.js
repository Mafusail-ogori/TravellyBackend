const database = require('../database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {secret} = require('../config')

const validateCompany = async(login, mail) => {
    const companyCount = await database.query(`SELECT COUNT(company_id) FROM companyinfo WHERE
company_login = '${login}' or company_mail = '${mail}'`);
    console.log(+companyCount.rows[0].count)
    return +companyCount.rows[0].count > 0
}

const addCompany = async(name, image, date, email, employeeAmount, password) => {
    await database.query(`INSERT INTO companyinfo (company_name, company_login, creation_date, 
company_email, employee_amount, company_password) 
VALUES ('${name}', '${image}', '${date}','${email}','${employeeAmount}','${password}')`)
}

class CompanyController {
    async registerCompany(req, res) {
        try{
            const data = req.file.filename
            const allData = req.body
            console.log(data)
            if(await validateCompany(allData.login, allData.mail)){
                return res.status(400).json({message: 'Found same company'})
            }
            await addCompany(allData.name, allData.image, allData.date, allData.email,
                allData.employeeAmount, allData.password)
            return res.status(200).json({message: 'Company added successfully'})
        } catch (e){
            console.log(e);
            res.status(400).json({message: 'Company register error'})
        }
    }
}