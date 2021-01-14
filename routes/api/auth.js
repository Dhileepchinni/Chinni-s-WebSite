const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult }= require('express-validator/check');
router.get('/',auth, async (req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-date');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');

    }
});

//@router  Post /api/auth

//@dsc     Authentication 
//@access  public
router.post(
    '/',
    [
    check('email','please enter a valid email').isEmail(),
    check('password','password is required').exists()
],
async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty())
{
    return res.status(400).json({error: errors.array()});
}
 const {email,password} = req.body; 
 try{
 let user = await User.findOne({email});
 if(!user){
   return res.status(400).json({error:[{msg:'Invalid credentials'}]});
 }
 
 const isMatch = await bcrypt.compare(password,user.password)
 if(!isMatch){
      res.status(400).json({error:[{msg:"Invalid credentials"}]});
 }

  const payload={
      user:{
        id:user.id
      }
  };
  jwt.sign(payload, config.get('jsonSecret') ,
  (err,token) => {
         if(err) throw err;
         res.json({token});
  });

 
 }
 catch(err)
  {
     console.error(err.message);
     res.status(500).send('server error');
  }
}
);
module.exports = router;