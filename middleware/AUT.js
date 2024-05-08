const JWT = require("jsonwebtoken");
const { NotAuthorizedError } = require("../errors");

const auth = (req, res, next) => {
    const { adminToken } = req.cookies;
    try {
        if (adminToken) {
            JWT.verify(adminToken, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    res.status(500).send("internal server error");
                    console.log(err)
                }
                req.admin = { id: decode.id, username: decode.username }
                next()
            })
        }
    } catch (error) {
        throw new NotAuthorizedError("Not Authorized")
    }
}

module.exports = auth