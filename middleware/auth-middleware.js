const jwt = require('jsonwebtoken');

const verify = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1]

    jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

function isAdmin(req, res, next) {
    console.log()
    if (req.user && req.user.role.includes("admin")) {
        next()
    } else {
        return res.status(403).send("Solo los administradores pueden realizar esta acción")
    }
}
module.exports = { verify, isAdmin }