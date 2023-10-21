const db = require("../model");
const ROLES = db.ROLES;

const User = db.user;

 checkExitstUserNameOrEmail = (req, res, next) => {
    //check username
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        if (user) {
            res.status(409).send({ message: "Tên tài khoản đã được sử dụng" });
            return;
        }

        //check email
        User.findOne({
            email: req.body.email
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            if (user) {
                res.status(409).send({ message: "Email đã được sử dụng" });
                return;
            }
            next();
        });    
    });
}

 checkRoleExisted = (req, res, next) =>{
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
          if (!ROLES.includes(req.body.roles[i])) {
            res.status(400).send({
              message: `Thất bại! Role ${req.body.roles[i]} không tồn tại!`
            });
            return;
          }
        }
      }

    next();
}

const verifySignUp = {
    checkExitstUserNameOrEmail,
    checkRoleExisted
};

module.exports= verifySignUp;