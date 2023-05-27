const env = require('dotenv')
const express = require('express')
const userRouter = require('./routes/user.routes')
const companyRouter = require('./routes/company.routes')
const port = process.env.port || 8080
const cors = require('cors')
const {urlencoded} = require("body-parser");
const bodyParser = require("body-parser");
const multer = require('multer')

env.config()

const app = express()

app.use(express.static('storage'))
app.use(cors())
app.use(bodyParser.json())
app.use('/user', userRouter)
app.use('/company', companyRouter)


app.listen(port, () => console.log(`server started on port ${port}`))