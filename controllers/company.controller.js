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

// class CompanyController {
//     async registerCompany(req, res){
//         try{
//             const {name, mail, password, amount, date, logo} = req.body
//             if (await validateCompany(name, mail)){
//                 return res.status(400).json({message: 'There is company already'})
//             }
//             const hashPassword = bcrypt.hashSync(password, 7)
//             await
//         } catch (e) {
//             console.log(e);
//             res.status(400).json({message: 'Register error'})
//         }
//     }
// }