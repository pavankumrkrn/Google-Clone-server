const JWT = require("jsonwebtoken");
const secret = require("./secret");

const createJWT = ({ id }) => {
  return JWT.sign({ id }, secret.getSecret(), { expiresIn: "1h" });
};

const authenticate = async (req, res, next) => {
  try {
    const bearer = await req.headers["authorization"];
    if (bearer === null) {
      return res.json({
        message: "Access failed",
        code: "red",
      });
    }
    JWT.verify(bearer, secret, (err, decode) => {
      if (res) next();
      else
        res.json({
          message: "Authentication failed",
          code: "red",
        });
    });
  } catch (error) {
    return res.json({
      message: "Authentication failed",
      code: "red",
    });
  }
};
module.exports = { createJWT, authenticate };
