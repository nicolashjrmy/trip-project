const jwt = require('jsonwebtoken')
const config = require('../configjwt')

module.exports ={
    fromHeader(token)
    {
        var bearer=token.split('Bearer ')
        return bearer[1]
    }
}