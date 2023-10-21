const mongoose = require("mongoose");

const tokenVerifyEmailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    token: {
        type: String,
        required: true
    }
}, {timestamps: true}
);


module.exports= mongoose.model("TokenVerifyEmail", tokenVerifyEmailSchema);;