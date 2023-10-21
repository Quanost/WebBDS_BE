const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
}, {timestamps: true}
);

module.exports = mongoose.model("Role", roleSchema);