const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.header('Authorization').split(' ')[1]
        if (!token) {
            return res.status(400).json({message: "Token not valid"})
        }
        const userData = jwt.verify(token, 'PIZZA_PEPPERONI')
        req.user = userData
        next()
    } catch (e) {
        console.log(e)
        return res.status(400).json({message: "Token not valid"})
    }
};