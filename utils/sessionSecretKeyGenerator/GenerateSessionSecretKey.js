const crypto = require("crypto");

const GenerateSessionSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = { GenerateSessionSecretKey };