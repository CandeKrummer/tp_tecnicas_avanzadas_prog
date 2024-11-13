require('mongoose');
const User = require('../models/usuario');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const login = async (mail, password) => {

    const cryptoPassword = require('crypto')
        .createHash('sha256')
        .update(password)
        .digest('hex');

    const result = await User.findOne({ mail: mail, password: cryptoPassword })

    if (result) {
        jwt.sign('payload', 'secret_key')
        const token = jwt.sign({ mail: mail, role: result.role }, process.env.TOKEN_KEY, { expiresIn: "1h" });
        return { token: token, user: result };
    }
    return null;

}

module.exports = { login }