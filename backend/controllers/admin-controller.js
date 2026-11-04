const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');

const adminRegister = async (req, res) => {
    try {
        const name = req.body.name ? req.body.name.trim() : '';
        const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
        const password = req.body.password;
        const schoolName = req.body.schoolName ? req.body.schoolName.trim() : '';

        // 1. Validate required fields
        if (!name || !email || !password || !schoolName) {
            return res.status(400).send({ message: 'All fields (name, email, password, schoolName) are required' });
        }

        // 2. Pre-check: if an administrator already exists, reject immediately
        const adminExists = await Admin.exists({});
        if (adminExists) {
            return res.status(403).send({
                message: 'Registration is closed. An administrator is already registered.'
            });
        }

        // 3. Pre-check for duplicate email or schoolName
        const existingAdminByEmail = await Admin.findOne({ email });
        const existingSchool = await Admin.findOne({ schoolName });

        if (existingAdminByEmail) {
            return res.status(409).send({ message: 'Email already exists' });
        }
        if (existingSchool) {
            return res.status(409).send({ message: 'School name already exists' });
        }

        // 4. Hash password exactly once (schema has no pre-save hook)
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // 5. Construct Admin with fixed systemSlot and hardcoded role
        // MongoDB's unique index on systemSlot guarantees at most ONE admin can ever be created,
        // atomically rejecting any simultaneous registration race conditions at the database level.
        const admin = new Admin({
            name,
            email,
            password: hashedPass,
            schoolName,
            role: 'Admin',
            systemSlot: 'initial-admin'
        });

        const savedAdmin = await admin.save();

        // 6. Guarantee password is excluded from response
        const responseData = savedAdmin.toObject();
        delete responseData.password;

        return res.status(201).send(responseData);
    } catch (err) {
        // Handle MongoDB duplicate key errors (code 11000)
        if (err.code === 11000) {
            if (err.keyPattern && err.keyPattern.systemSlot) {
                return res.status(403).send({
                    message: 'Registration is closed. An administrator is already registered.'
                });
            }
            if (err.keyPattern && err.keyPattern.email) {
                return res.status(409).send({ message: 'Email already exists' });
            }
            if (err.keyPattern && err.keyPattern.schoolName) {
                return res.status(409).send({ message: 'School name already exists' });
            }
            return res.status(403).send({
                message: 'Registration is closed. An administrator is already registered.'
            });
        }

        res.status(500).json(err);
    }
};

const adminLogIn = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        let admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).send({ message: "User not found" });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).send({ message: "Invalid password" });
        }

        const responseData = admin.toObject();
        delete responseData.password;

        return res.status(200).send(responseData);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            const responseData = admin.toObject();
            delete responseData.password;
            return res.status(200).send(responseData);
        } else {
            return res.status(404).send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail };
