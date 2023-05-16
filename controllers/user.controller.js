const database = require('../database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {secret} = require('../config')

const validateUser = async (login, mail) => {
    const userCount = await database.query(`SELECT COUNT(user_id) FROM userinfo  WHERE user_login = '${login}' 
        or user_mail = '${mail}'`);
    console.log(+userCount.rows[0].count)
    return +userCount.rows[0].count > 0
}

const addUser = async (mail, password, login) => {
    await database.query(`INSERT INTO userinfo (user_mail, user_password, user_login) 
VALUES ('${mail}', '${password}', '${login}')`)
}

const validatePassword = async (login, userPassword) => {
    const user = await database.query(`SELECT * FROM userinfo WHERE user_login = 'testuser' 
        or user_mail = 'testuser'`);
    return bcrypt.compareSync(userPassword, user.rows[0].user_password);
}

const getUser = async (login) => {
     const user = await database.query(`SELECT * FROM userinfo WHERE user_mail = '${login}' 
        or user_login = '${login}'`);
    return user.rows[0];
}

const generateAccessToken = (id, login) => {
    const payload = {
        id,
        login
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'})
}

class UserController {
    async registerUser(req, res) {
        try {
            const {mail, password, login} = req.body
            if (await validateUser(login, mail)) {
                return res.status(400).json({message: 'Found same user'})
            }
            const hashPassword = bcrypt.hashSync(password, 7)
            await addUser(mail, hashPassword, login)
            return res.json({message: 'User added successfully'})
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Register error'})
        }
    }

    async logInUser(req, res) {
        try {
            const {login, password} = req.body
            if (!await validateUser(login, password)) {
                return res.status(400).json({message: `User with ${login} not found`})
            }
            if (!await validatePassword(login, password)) {
                return res.status(400).json({message: `User with ${login} send not correct password`})
            }
            const user = await getUser(login)
            const token = generateAccessToken(user.user_id, user.user_login)
            return res.json(token)
        } catch (e) {
            console.log(e)
            res.status(400).json({message: "Login error"})
        }
    }
}

module.exports = new UserController()