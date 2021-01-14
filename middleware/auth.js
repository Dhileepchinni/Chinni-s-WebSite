const jwt = require('jsonwebtoken');
const config = require('config');
module.exports = function( req,res,next) {
    // get token first
    const token = req.header('X-auth-token');
    //checking whether token is working or not
    if(!token){
       return res.status(401).json({msg:'No token, Authorized denied'});
    }

    try{
       const decode = jwt.verify(token,config.get('jsonSecret'));
       req.user = decode.user;
       next();
    } catch(err){
         res.status(401).json({msg:'Invalid Token'});
    }
};