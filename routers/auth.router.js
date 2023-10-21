const { verifySignUp } = require("../middleware");
const controller = require("../controllers/authController");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkExitstUserNameOrEmail,
      verifySignUp.checkRoleExisted
    ],
    controller.signup
  );

  app.get("/api/auth/verify/:id/:token", controller.verifyEmail);
  app.post("/api/auth/signin", controller.signin);
};