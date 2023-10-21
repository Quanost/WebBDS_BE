const db = require("../model");
const User = db.user;
const Role = db.role;
const TokenVerifyEmail= db.tokenVerifyEmail;

const crypto = require("crypto");
const middleware = require("../middleware")

const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { assert } = require("console");


//verify email sign up
const sendEmail =  async (res,userId, useremail) => {
    try {
        const token = await new TokenVerifyEmail({
            userId: userId,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
    
        const message = `${process.env.BASE_URL}/auth/verify/${userId}/${token.token}`;
       await middleware.verifyEmail(useremail, "Verify Email", message);
    
        res.status(201).send({message:"Vui lòng vào email để xác nhận"})
    } catch (error) {   
        res.status(500).send(error);
    }
}

exports.signup = (req, res) => {
    const user = new User({
        name: req.body.name,
        phone: req.body.phone,
        gender: req.body.gender,
        username: req.body.username,
        email: req.body.email,
        password: bcryptjs.hashSync(req.body.password, 8)
    });

   

    user.save((err, user) => {
        if (err) {
            let errors = { name: '', phone: '', gender: '', username: '', password: '', email: ''}

            if(err.message.includes('User validation failed')){
                Object.values(err.errors).forEach(({properties}) => {
                    errors[properties.path] = properties.message
                });

                res.status(500).send({errors});
            }
            
            return;
        }
        if (req.body.roles && req.body.roles.length > 0) {
            Role.find({
                name: { $in: req.body.roles }
            }, (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                user.roles = roles.map(role => role._id);
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    // res.status(200).send({ message: "Đăng ký thành công" })
                    sendEmail(res,user.id, user.email);
                   
                })
            })
        } else if (!req.body.roles || req.body.roles.length === 0) {
            Role.find({
                name: "user"
            }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                user.roles = role.map(role => role._id);
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    // res.status(200).send({ message: "Đăng ký thành công" })
                    sendEmail(res,user.id, user.email);
                })
            })
        }
    })
}


exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(400).send("link không hợp lệ");
    
        const token = await TokenVerifyEmail.findOne({
          userId: user._id,
          token: req.params.token,
        });
        if (!token) return res.status(400).send("link không hợp lệ");
    
        await User.updateOne({ _id: user._id, verified: true });
        console.log("token Id remove", token._id);
        await TokenVerifyEmail.findByIdAndRemove(token._id);
    
        res.send("xác nhận email thành công");
      } catch (error) {
        res.status(400).send("Đã xảy ra lỗi: ", error);
      }
}

exports.signin = async (req, res) => {
    User.findOne({
        username: req.body.username
    })
        .populate("roles", "-__v")
        .exec(async (err, user) => {
            
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (!user) {
                return res.status(404).send({ message: "Không tìm thấy tài khoản." });
            }

            var passwordIsValid = bcryptjs.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Nhập sai mật khẩu"
                });
            }

            if(!user.verified){
                let token = await TokenVerifyEmail.findOne({userId: user._id});
                if(!token) {
                    await sendEmail(res, user.id, user.email);
                }else {
                    return res.status(400).send({message: 'Vui lòng xác nhận email'});
                }  
            }
            const token = jwt.sign({ id: user.id },
                process.env.JWT_ACCESS_KEY,
                {
                    algorithm: 'HS256',
                    allowInsecureKeySizes: true,
                    expiresIn: 86400, // 24 hours
                });

            var authorities = [];

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }
            res.status(200).send({
                id: user._id,
                name: user.name,
                phone: user.phone,
                gender: user.gender,
                balance: user.balance,
                verified: user.verified,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token
            });
        });
};