const jwt = require("jsonwebtoken");
const db = require("../model");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        res.status(403).send({ message: "Chưa có token" });
    }

    jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
        if (err) {
            res.status(401).send({ message: "Unauthorized" });

        }
        req.userId = decoded.id;
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }


        Role.find({
            _id: {$in: user.role}
        }, (err, roles) => {
            if(err){
                res.status(500).send({message: err});
                return;
            
            }

            for(let i =0; i< roles.length; i++){
                if(roles[i].username === "admin"){
                    next();
                    return ;
                }
            }

            res.status(403).send({message: " Yêu cầu quyền Admin"});
            return ;
        })
    })
}

const authJwt = {
    verifyToken,
    isAdmin
};

module.exports= authJwt;
