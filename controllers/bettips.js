const Bet = require('../model/bettips');
const { BadRequestError, NotFoundError } = require("../errors");
const Admin = require("../model/admin");
const { deleteFile } = require("../middleware/deleteFile");
const path = require("path");
const fs = require("fs");


//create bet
//request and response parameters for res and req 
const createBet = async (req, res) => {
    const { title, tips } = req.body;
    if (!title || !tips) {
        if (req.file) {
            const filepath = path.join(__dirname, "..", "upload", req.file.filename);
            if (fs.existsSync(filepath)) {
                deleteFile(filepath);
            }
        }
        throw new BadRequestError("All fields are required...");
    }
    if (!req.file) {
        throw new BadRequestError("please, upload a file")
    }

    const bet = await Bet.findOne({ title, tips });
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError(`No admin was found with id: ${req.admin.id}`);
    }
    if (bet) {
        const filepath = path.join(__dirname, "..", "upload", req.file.filename);
        if (fs.existsSync(filepath)) {
            deleteFile(filepath);
        }
        throw new BadRequestError("bet already exists");
    }
    if (admin) {
        const createdBet = new Bet({
            title,
            tips,
            file: req.file.filename,
            createdBy: req.admin.id
        })

        if (createdBet) {
            await createdBet.save()
        }
        res.status(200).json({ msg: "bet tips created successfully..." });
    }
}

//get all bet
const getAllBet = async (req, res) => {
    const limit = parseInt(req.query.limit);
    const allBet = await Bet.find({}).select("-__v").sort({ createdAt: -1 }).limit(limit);
    if (allBet) {
        const dataToSend = allBet.map((data) => ({
            id: data._id,
            title: data.title,
            tips: data.tips,
            file: data.file
        }))
        res.status(200).json(dataToSend);
    }
}

module.exports = {
    createBet,
    getAllBet
}