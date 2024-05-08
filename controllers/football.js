const Football = require("../model/football");
const Admin = require("../model/admin");
const { NotAuthorizedError, BadRequestError, NotFoundError } = require("../errors");
const path = require("path");
const { deleteFile } = require("../middleware/deleteFile");
const fs = require("fs");


const createFootball = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotAuthorizedError(`No admin was found with id: ${req.admin.id}`)
    }
    const allowedCategories = ['News', 'EPL', 'Laliga', 'Serie A', 'Bundesliga', 'NPFL', 'Others', 'UCL'];
    const { title, news, category, date } = req.body;


    if (!title || !news || !category || !allowedCategories.includes(category)) {
        if (req.files.length > 0) {
            for (const image of req.files) {
                const filepath = path.join(__dirname, "..", "upload", image.filename);
                if (fs.existsSync(filepath)) {
                    deleteFile(filepath)
                }
            }
        }
        throw new BadRequestError("All fields are required, make sure you entering the correct value for category")
    }

    if (req.files.length === 0) {
        throw new BadRequestError("a file is required")
    }

    const fileToSave = req.files.map((image) => {
        const { filename, originalname } = image;
        return { filename, originalname }
    })


    const existingNews = await Football.findOne({ title, category });
    if (existingNews) {
        for (const image of fileToSave) {
            const filepath = path.join(__dirname, "..", "upload", image.filename);
            if (fs.existsSync(filepath)) {
                deleteFile(filepath)
            }
        }
        throw new BadRequestError("the news already exists...")
    }
    if (admin) {
        const createdFootball = new Football({
            title,
            news,
            file: fileToSave,
            category,
            date: date ? new Date(date) : Date.now(),
            createdBy: req.admin.id
        })

        if (createdFootball) {
            await createdFootball.save();
        }
        res.status(201).json({ msg: `created successfully....` })
    }
}

const getAllFootball = async (req, res) => {
    // const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const limit = parseInt(req.query.limit);
    const getFootball = await Football.find({}).select("-__v").sort({ createdAt: -1 }).limit(limit);
    if (getFootball) {
        const dataToSend = getFootball.map((data) => ({
            id: data._id,
            title: data.title,
            news: data.news,
            file: data.file,
            category: data.category,
            date: data.date.toDateString()
        }))
        res.status(200).json(dataToSend);
    }
}


const getSingleFootball = async (req, res) => {
    const { footballID } = req.params;
    const getSingle = await Football.findById(footballID).select("-__v");
    if (getSingle) {
        const dataToSend = {
            id: getSingle._id,
            title: getSingle.title,
            news: getSingle.news,
            file: getSingle.file,
            category: getSingle.category,
            date: getSingle.date.toDateString()
        }
        res.status(200).json(dataToSend)
    }
}

const adminDeleteFootball = async (req, res) => {
    const { footballID } = req.params;
    const football = await Football.findById(footballID)
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        throw new NotFoundError("No admin was found with the supplied id...")
    }

    if (!football) {
        throw new NotFoundError("No football was found with the supplied id...")
    }
    if (admin) {
        const deleteFootball = await Football.findByIdAndDelete(footballID);
        if (deleteFootball) {
            for (const image of football.file) {
                const filepath = path.join(__dirname, "..", "upload", image.filename);
                if (fs.existsSync(filepath)) {
                    deleteFile(filepath)
                }
            }
        }
        const data = await Football.find({}).select("-__v").sort({ createdAt: -1 })
        if(data){
            const dataToSend = data.map((data) => ({
                id: data._id,
                title: data.title,
                news: data.news,
                file: data.file,
                category: data.category,
                date: data.date.toDateString()
            }))
            res.status(200).json({ msg: `deleted football with id: ${football._id}`, data: dataToSend });
        }
        
    }
}

const adminUpdateFootball = async (req, res) => {
    const admin = await Admin.findById(req.admin.id);
    const { footballID } = req.params;

    if (!admin) {
        throw new NotFoundError("No id found for the admin");
    }
    const football = await Football.findById(footballID);

    if (!football) {
        throw new NotFoundError(`no football news was found with id: ${footballID}`)
    }
    const { title, news, category } = req.body;
    if (!title && !news && !category && !req.files.length) {
        throw new BadRequestError("Please enter a field to update...")
    }
    const fileToSave = req.files.length && req.files.map((image) => {
        const { filename, originalname } = image;
        return { filename, originalname }
    });

    if (admin) {
        const upadatedData = await Football.findByIdAndUpdate(footballID, {
            title: title ? title : football.title,
            news: news ? news : football.news,
            file: req.files.length ? fileToSave : football.file,
            category: category ? category : football.category,
            date: football.date,
            createdBy: football.createdBy
        }, { new: true })
        if (upadatedData){
            if(req.files.length){
                for (const image of football.file) {
                    const filepath = path.join(__dirname, "..", "upload", image.filename);
                    if (fs.existsSync(filepath)) {
                        deleteFile(filepath)
                    }
                }
            }
        }
        const data = await Football.find({}).select("-__v").sort({ createdAt: -1 })
        if(data){
            const dataToSend = data.map((data) => ({
                id: data._id,
                title: data.title,
                news: data.news,
                file: data.file,
                category: data.category,
                date: data.date.toDateString()
            }))
            res.status(200).json({ msg: `updated football with id: ${upadatedData._id}`, data: dataToSend });
        }
    }
}

const getAllFootballNews = async (req, res) => {
    const getFootball = await Football.find({ category: "News" }).select("-__v").sort({ createdAt: -1 });
    if (getFootball) {
        const dataToSend = getFootball.map((data) => ({
            id: data._id,
            title: data.title,
            news: data.news,
            file: data.file,
            category: data.category,
            date: data.date.toDateString()
        }))
        res.status(200).json(dataToSend);
    }
}


const getAllFootballEPL = async (req, res) => {
    //const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const limit = parseInt(req.query.limit)
    const getFootball = await Football.find({ category: "EPL" })
        .select("-__v")
        .sort({ createdAt: -1 })
        .limit(limit);

    if (getFootball) {
        const dataToSend = getFootball.map((data) => ({
            id: data._id,
            title: data.title,
            news: data.news,
            file: data.file,
            category: data.category,
            date: data.date.toDateString()
        }))
        res.status(200).json(dataToSend);
    }
}


const getAllFootballLaliga = async (req, res) => {
    //const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const limit = parseInt(req.query.limit);
    const getFootball = await Football.find({ category: "Laliga" })
        .select("-__v")
        .sort({ createdAt: -1 })
        .limit(limit);

    if (getFootball) {
        const dataToSend = getFootball.map((data) => ({
            id: data._id,
            title: data.title,
            news: data.news,
            file: data.file,
            category: data.category,
            date: data.date.toDateString()
        }))
        res.status(200).json(dataToSend);
    }
}

const getAllFootballBundesliga = async (req, res) => {
    //const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const limit = parseInt(req.query.limit);
    const getFootball = await Football.find({ category: "Bundesliga" })
        .select("-__v")
        .sort({ createdAt: -1 })
        .limit(limit);

    if (getFootball) {
        const dataToSend = getFootball.map((data) => ({
            id: data._id,
            title: data.title,
            news: data.news,
            file: data.file,
            category: data.category,
            date: data.date.toDateString()
        }))
        res.status(200).json(dataToSend);
    }
}


const getAllFootballUCL = async (req, res) => {
    const limit = parseInt(req.query.limit);
    //const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const getFootball = await Football.find({ category: "UCL" })
        .select("-__v")
        .sort({ createdAt: -1 })
        .limit(limit);

    if (getFootball) {
        const dataToSend = getFootball.map((data) => ({
            id: data._id,
            title: data.title,
            news: data.news,
            file: data.file,
            category: data.category,
            date: data.date.toDateString()
        }))
        res.status(200).json(dataToSend);
    }
}

const NPFL = async (req, res) => {
    const limit = parseInt(req.query.limit);
    //const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const getFootball = await Football.find({ category: "NPFL" })
        .select("-__v")
        .sort({ createdAt: -1 })
        .limit(limit);

    if (getFootball) {
        const dataToSend = getFootball.map((data) => ({
            id: data._id,
            title: data.title,
            news: data.news,
            file: data.file,
            category: data.category,
            date: data.date.toDateString()
        }))
        res.status(200).json(dataToSend);
    }
}

const ItalianSirieA = async (req, res) => {
    //const limit = req.query.limit ? parseInt(req.query.limit) : 9;
    const limit = parseInt(req.query.limit);
    const getFootball = await Football.find({ category: "Serie A" })
        .select("-__v")
        .sort({ createdAt: -1 })
        .limit(limit);

    if (getFootball) {
        const dataToSend = getFootball.map((data) => ({
            id: data._id,
            title: data.title,
            news: data.news,
            file: data.file,
            category: data.category,
            date: data.date.toDateString()
        }))
        res.status(200).json(dataToSend);
    }
}

const generalSearch = async (req, res) => {
    const { query } = req.query;
    let searchCriteria = {};

    if (query) {
        const regex = new RegExp(query, "i");
        searchCriteria = {
            $or: [
                { title: { $regex: regex } },
                { news: { $regex: regex } },
                { category: { $regex: regex } },
            ]
        };
    }

    try {
        const football = await Football.find(searchCriteria).sort({ createdAt: -1 });
        if (football) {
            const dataToSend = football.map((data) => ({
                id: data._id,
                title: data.title,
                news: data.news,
                file: data.file,
                category: data.category,
                date: data.date.toDateString()
            }))
            res.json(dataToSend);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createFootball,
    getAllFootball,
    getSingleFootball,
    adminDeleteFootball,
    adminUpdateFootball,
    getAllFootballNews,
    getAllFootballEPL,
    getAllFootballLaliga,
    getAllFootballUCL,
    getAllFootballBundesliga,
    NPFL,
    ItalianSirieA,
    generalSearch
}