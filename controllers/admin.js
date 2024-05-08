const { NotFoundError, BadRequestError, NotAuthorizedError, ConflictError } = require('../errors');
const Admin = require('../model/admin');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new new BadRequestError('all fields are required...')();
  }
  const existingUser = await Admin.findOne({ email });
  if (existingUser) {
    throw new ConflictError('admin already exists...');
  }

  const harshedPassword = await bcrypt.hash(password, 10);

  const createAdmin = new Admin({
    username,
    email,
    password: harshedPassword
  });

  if (createAdmin) {
    await createAdmin.save();
  }
  const token = JWT.sign({ username: createAdmin.username, id: createAdmin._id },
    process.env.JWT_SECRET, { expiresIn: '30d' });

  return res.cookie('adminToken', token,
    { httpOnly: true, sameSite: 'none', secure: true })
    .status(200).json({ user: { username: createAdmin.username } });
};

/** LOGIN ADMIN */
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('All fields are required....');
  }
  /** FIND USER */
  const Admins = await Admin.findOne({ email });

  if (!Admins) {
    throw new NotFoundError(`No user was found with the email ${email}`);
  }
  /** CHECK IF PASSWORD IS VALID */
  const ispasswordOk = await bcrypt.compare(password, Admins.password);
  if (!ispasswordOk) {
    throw new NotAuthorizedError('Please enter valid credentials ');
  }

  /** GENERATING A TOKEN */
  const token = JWT.sign({ username: Admins.username, id: Admins._id },
    process.env.JWT_SECRET, { expiresIn: '30d' });

  res.cookie('adminToken', token,
    { httpOnly: true, sameSite: 'none', secure: true })
    .status(200).json({ user: { username: Admins.username } });
};

/** persist login */
const persistLogin = (req, res) => {
  try {
    const { adminToken } = req.cookies;
    if (adminToken) {
      JWT.verify(adminToken, process.env.JWT_SECRET, {}, (err, decode) => {
        if (err) {
          console.log('error verifying token', err);
          res.status(500).json({ msg: 'errr, internal server error' });
        } else {
          res.status(200).json(decode);
        }
      });
    } else {
      console.log("No token")
    }
  } catch (error) {
    console.log(error);
    throw new NotAuthorizedError('Not authorized');
  }
};

const logoutAdmin = (req, res) => {
  res.cookie('adminToken', '').json(true);
};

module.exports = {
  loginAdmin,
  createAdmin,
  persistLogin,
  logoutAdmin
};
