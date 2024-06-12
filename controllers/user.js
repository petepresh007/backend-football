const User = require("../model/user");
const { NotFoundError, ConflictError, BadRequestError, NotAuthorizedError } = require("../errors");
const { deleteFile } = require("../middleware/deleteFile");
const fs = require("fs");
const path = require("path");
const { sendMail } = require("../middleware/sendEmail");
const bcrypt = require("bcrypt");
const Admin = require("../model/admin");
const JWT = require("jsonwebtoken");

const registerUser = async (req, res) => {
    const { firstname, lastname, username, email, password, confirmpassword, date } = req.body;
    if (!firstname || !lastname || !username || !email || !password || !confirmpassword) {
        if (req.file) {
            const filePath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        throw new BadRequestError("All fields are required...");
    }

    if (!req.file) {
        throw new BadRequestError("please, upload a profile picture...")
    }

    if (password !== confirmpassword) {
        if (req.file) {
            const filePath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        throw new ConflictError("make sure you enter the same password for password and confirm password");
    }

    const fileUrl = req.file.filename;

    const existingUser = await User.findOne({ username, email })

    if (existingUser) {
        const filePath = path.join(__dirname, "..", "upload", req.file.filename);
        if (fs.existsSync(filePath)) {
            deleteFile(filePath);
        }
        throw new ConflictError(`"${existingUser.username}" is already in use by someone else...`);
    }

    const harshedPassword = await bcrypt.hash(password, 10) //10 salt rounds 

    const createdUser = new User({
        firstname,
        lastname,
        username,
        email,
        password: harshedPassword,
        confirmpassword: harshedPassword,
        file: fileUrl,
        date: date ? new Date(date) : Date.now()
    });
    //from to subject message
    if (createdUser) {
        await createdUser.save()
        const from = process.env.SMTP_MAIL
        const to = email
        const subject = `Hi ${firstname} ${lastname} Welcome`
        const message = `
            <p>
                Your account has been registered succefully, if approved, you will be contacted<br>
                cheers
            </p>
        `
        await sendMail(from, to, subject, message)
    }

    res.status(201).json({ msg: `Thank you. check ${email} for confirmation` });
}


const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("please enter email and password to login...");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new BadRequestError("Your email or password is incorrect")
    }

    const isPassword = await user.checkPassword(password);
    if (!isPassword) {
        throw new NotAuthorizedError("Your email or password is incorrect");
    }

    if (!user.approved) {
        throw new NotAuthorizedError("Your account is not yet approved...")
    }

    const token = user.JWT_TOK();
    res.cookie("user_token", token,
        { /**maxAge: 5000000,*/ httpOnly: true, sameSite: "none", secure: true })
        .status(200).json({ user: { username: user.username, token } });
}

const approveUser = async (req, res) => {
    const { userID } = req.params;
    const admin = await Admin.findById(req.admin.id);
    const user = await User.findById(userID);
    if (!user) {
        throw new NotFoundError("user has been deleted or user does not exists");
    }

    if (admin) {
        if (user.approved === true) {
            throw new ConflictError("user has already been approved");
        } else {
            user.approved = true;
            user.approvedBy = req.admin.username;
            await user.save();

            const from = process.env.SMTP_MAIL
            const to = user.email
            const subject = `Hi ${user.firstname}`
            const message = `
            <p>
                Your account has been Approved
            </p>
        `
            await sendMail(from, to, subject, message)
            const userdataApproved = await User.find({ approved: true }).select("-__v -password -confirmpassword");
            const userdataNotApproved = await User.find({ approved: false }).select("-__v -password -confirmpassword");
            res.status(200).json({ msg: true, dataApproved: userdataApproved, dataNotApproved: userdataNotApproved });
        }
    }
}

const blockUser = async (req, res) => {
    const { userID } = req.params;
    const admin = await Admin.findById(req.admin.id);
    const user = await User.findById(userID);
    if (!user) {
        throw new NotFoundError("user has been deleted or user does not exists")
    }

    if (admin) {
        if (user.approved === false) {
            throw new ConflictError("user has been blocked already");
        } else {
            user.approved = false;
            user.approvedBy = req.admin.username;
            await user.save();
            const userdataApproved = await User.find({ approved: true }).select("-__v -password -confirmpassword");
            const userdataNotApproved = await User.find({ approved: false }).select("-__v -password -confirmpassword");
            res.status(200).json({ msg: true, dataApproved: userdataApproved, dataNotApproved: userdataNotApproved });
        }
    }
}


const stayLoggedIn = (req, res) => {
    try {
        const { user_token } = req.cookies;
        if (user_token) {
            JWT.verify(user_token, process.env.JWT_SECRET, {}, (err, decode) => {
                if (err) {
                    console.log("error verifying token", err);
                    res.status(500).json({ msg: "errr, internal server error" })
                } else {
                    res.status(200).json(decode)
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new NotAuthorizedError("Not authorized")
    }
}

const getSingleUser = async (req, res) => {
    const { userID } = req.params;
    const user = await User.findById(userID).select("-password -confirmpassword -__v");
    if (user) {
        res.status(200).json(user);
    }
}

/**DO IT THE EASY WAY PROVIDED MAN IS LOGGED IN */
const getSingUserID = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password -confirmpassword -__v");
    if (user) {
        res.status(200).json(user);
    }
}


const logoutUser = (req, res) => {
    res.clearCookie('user_token', { httpOnly: true, sameSite: 'none', secure: true })
        .json(true);
};



//update profile pics
const updateProfilePics = async (req, res) => {
    if (!req.file) {
        throw new BadRequestError("please select an image...")
    }
    const profilePics = req.file.filename;
    const user = await User.findById(req.user.id);

    if (user) {
        const filePath = path.join(__dirname, "..", "upload", user.file);
        if (fs.existsSync(filePath)) {
            deleteFile(filePath);
        }
        const updateProfilePics = await User.findByIdAndUpdate(req.user.id, {
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            password: user.password,
            confirmpassword: user.confirmpassword,
            file: profilePics,
            date: user.date,
            approved: user.approved,
            approvedBy: user.approvedBy
        }, { new: true }).select("-__v -password -confirmpassword");
        if (updateProfilePics) {
            res.status(200).json({ msg: "profile picture uploaded suucessfully...", data: updateProfilePics })
        }
    }

}

//update username and password
const updateUsernamePassword = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new NotFoundError("No user was not found...")
    }

    const { password, newpassword, confirmpassword } = req.body;
    const isPasswordOk = await bcrypt.compare(password, user.password)
    if (!isPasswordOk) {
        throw new BadRequestError("my Friend, enter a valid password")
    }

    if (newpassword !== confirmpassword) {
        throw new BadRequestError("Make sure your new pasword and confirm password fields are the same")
    }

    const newPass = await bcrypt.hash(newpassword, 10) //10 salt rounds


    if (user) {
        const updatePassword = await User.findByIdAndUpdate(req.user.id, {
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            password: newPass,
            confirmpassword: newPass,
            file: user.file,
            date: user.date,
            approved: user.approved,
            approvedBy: user.approvedBy
        }, { new: true });

        if (updatePassword) {
            res.status(200).json({ msg: `password updated successfully...` });
        }
    }

}

/**NOT ACTIVATED USER */
const getNotActivatedUsers = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError("Throw new bad request error...")
    }
    if (admin) {
        const notActivatedUSer = await User.find({ approved: false }).select("-__v -password -confirmpassword");
        if (notActivatedUSer) {
            res.status(200).json(notActivatedUSer)
        }
    }
}

/**ACTIVATED USERS */
const getActivatedUsers = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError("Throw new bad request error...")
    }
    if (admin) {
        const ActivatedUSer = await User.find({ approved: true }).select("-__v -password -confirmpassword");
        if (ActivatedUSer) {
            res.status(200).json(ActivatedUSer)
        }
    }
}

/**get all users */
const getAllUsers = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError("No admin was found...")
    }
    if (admin) {
        const allUSer = await User.find({}).select("-__v -password -confirmpassword");
        if (allUSer) {
            res.status(200).json(allUSer)
        }
    }
}

const deleteSingleUser = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    const { userID } = req.params;
    const user = await User.findById(userID);
    if (!user) {
        throw new NotFoundError("no user was found...");
    }
    if (!admin) {
        throw new NotFoundError("No admin was found...");
    }

    if (admin) {
        const deleteUser = await User.findByIdAndRemove(userID, { new: true })
        if (deleteUser) {
            const filePath = path.join(__dirname, "..", "upload", user.file);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath)
            }
            const data = await User.find({}).select("-__v -password -confirmpassword");
            const userdataApproved = await User.find({ approved: true }).select("-__v -password -confirmpassword");
            const userdataNotApproved = await User.find({ approved: false }).select("-__v -password -confirmpassword");
            res.status(200).json({ msg: "deleted successfully...", data: data, dataApproved: userdataApproved, dataNotApproved: userdataNotApproved })
        }
    }
}


module.exports = {
    registerUser,
    loginUser,
    approveUser,
    blockUser,
    stayLoggedIn,
    getSingleUser,
    logoutUser,
    updateProfilePics,
    getSingUserID,
    updateUsernamePassword,
    getNotActivatedUsers,
    getActivatedUsers,
    getAllUsers,
    deleteSingleUser
}