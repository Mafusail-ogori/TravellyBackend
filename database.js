const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    password: '*******' ,
    host: 'localhost',
    port: 5432,
    database: 'Travelly'
})

pool.connect((err) => {
    if(err){
        console.log('Here');
    }
})

module.exports = pool
