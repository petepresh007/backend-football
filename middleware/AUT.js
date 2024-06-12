const JWT = require("jsonwebtoken");
const { NotAuthorizedError } = require("../errors");

//function to authenticate user token
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



module.exports.AUTHTWOUSER = (req, res, next) => {
    try {
        const { user_token } = req.cookies;
        if (user_token) {
            JWT.verify(user_token, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    console.log("error verifying token", err);
                    res.status(500).json({ msg: "errr, internal server error" })
                } else {
                    req.user = { username: decode.username, id: decode.userID, file: decode.file }
                    next()
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new NotAuthorizedError("Not authorized")
    }
}

