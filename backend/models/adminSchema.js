const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Admin",
        immutable: true,
    },
    schoolName: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    systemSlot: {
        type: String,
        default: "initial-admin",
        unique: true,
        immutable: true,
    }
});

module.exports = mongoose.model("admin", adminSchema);
