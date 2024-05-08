const Landing = require("../model/landing");
const Admin = require("../model/admin");
const { NotFoundError, BadRequestError } = require("../errors");
const path = require("path");
const fs = require("fs");
const { deleteFile } = require("../middleware/deleteFile");



const createLanding = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError(`No admin was found with id: ${req, admin.id}`);
    }
    const { writeup } = req.body;
    if (!writeup) {
        if (req.file) {
            const filePath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filePath)) {
                deleteFile(filePath);
            }
        }
        throw new BadRequestError("a writeup is needed");
    }
    if (!req.file) {
        throw new BadRequestError("you need to upload a file")
    }

    const existingWriteUp = await Landing.findOne({ writeup });
    if (existingWriteUp) {
        const filePath = path.join(__dirname, "..", "upload", req.file.filename);
        if (fs.existsSync(filePath)) {
            deleteFile(filePath);
        }
        throw new BadRequestError("landing already exists")
    }
    if (admin) {
        const createdWriteUp = new Landing({
            writeup,
            file: req.file.filename
        })
        if (createdWriteUp) {
            await createdWriteUp.save()
        }
        res.status(201).json({ msg: `created successfully...` })
    }
}

const getAllWriteUp = async (req, res) => {
    const getAll = await Landing.find({}).sort({ createdAt: -1 }).select("-__v");
    if (getAll) {
        res.status(200).json(getAll)
    }
}


module.exports = {
    createLanding,
    getAllWriteUp
}