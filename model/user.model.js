const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng điền tên (name)']
    },
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return /((09|03|07|08|05)+([0-9]{8})\b)/g.test(v)
            },
            message: props => `${props.value} không phải là số điện thoại hợp lệ. Số điện thoại phải bằng đầu bằng 1 trong các số sau [09,03,07,08,05] theo sau đó là 8 chữ số`
        },
        required: [true, 'Vui lòng điền số điện thoại']
    },
    gender: {
        type: String,
        enum: {
            values: ['Nam', 'Nữ', 'Khác'],
            message:props => `${props.value} không phải là giới tính hợp lệ. Trường giới tính chỉ nhận vào 1 trong các giá trị [Nam, Nữ, Khác]`
        },
        required: [true, 'Vui lòng điền giới tính (gender)']
    },
    balance: {
        type: Number,
        default: 0
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Vui lòng điền username']
    },
    password: {
        type: String,
        // validate: {
        //     validator: function(v) {
        //         return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d][A-Za-z\d!@#$%^&*()_+]{7,19}/g.test(v)
        //     },
        //     message: `Mật khẩu phải có 7-19 ký tự và chứa ít nhất một chữ cái, một số và một ký tự đặc biệt`
        // },
        required: [true, 'Vui lòng điền password']
    },
    email: {
        type: String,
        validate: {
            validator: function(v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/g.test(v)
            },
            message: props => `${props.value} không hợp lệ. Email phải có dạng example@gmai.com`
        },
        unique: true,
        required: [true, 'Vui lòng điền email']
    },
    verified: {
        type: Boolean,
        default: false
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }
    ]
}, { timestamps: true }
);


const User = mongoose.model("User", userSchema);

module.exports = User;