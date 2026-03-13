import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];

  if(token == null){
    return res.status(401).json({ error: "No accesss token"})
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err){
      return res.status(403).json({ error: "Access token is invalid" })
    }

    req.user = user.id
    next()

  })

}