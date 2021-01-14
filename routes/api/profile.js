const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const axios = require('axios');
const config = require('config');
const {check,validationResult} = require('express-validator');
//@route GET api/profile/me
//@desc get current user profile
//@access private
router.get('/me',auth,async(req,res)=>{
    try {
        const profile = await  Profile.findOne({
            user:req.user.id
        }).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:'no profile found'});
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});
//@route post api/profile
//@desc create/update user profile
//@access private
router.post('/',[auth,[
    check('status','status is required')
    .not()
    .isEmpty(),
    check('skills','skills is required')
    .not()
    .isEmpty()
    ]
],
  async  (req,res)=>{
      const errors = validationResult(req);
      if(!errors.isEmpty()){
          return res.status(400).json({errors:errors.array()});
      }
      const {
          company,
          website,
          location,
          bio,
          status,
          githubusername,
          skills,
          youtube,
          facebook,
          twitter,
          instagram,
          linkedin
      }= req.body;

      const profileFields={};
      profileFields.user = req.user.id;
      if(company) profileFields.company=company;
      if(website) profileFields.website=website;
      if(location) profileFields.location=location;
      if(bio) profileFields.bio=bio;
      if(status) profileFields.status=status;
      if(githubusername) profileFields.githubusername=githubusername;
      if(skills){
          profileFields.skills = skills.split(',').map((skill) => ' ' + skill.trim());
      }
      profileFields.social={}
      if (youtube) profileFields.social.youtube=youtube;
      if (twitter) profileFields.social.twitter=twitter;
      if (facebook) profileFields.social.facebook=facebook;
      if (linkedin) profileFields.social.linkedin=linkedin;
      if (instagram) profileFields.social.instagram=instagram;
      try {
          let profile = Profile.findOne({user:req.user.id});
          if(profile){
              profile=await Profile.findOneAndUpdate(
              
                  {user:req.user.id},
                  {$set:profileFields},
                  {new:true,useFindAndModify:false ,upsert: true, setDefaultsOnInsert: true }
              );
             
              return res.json(profile);
          }
          profile = new Profile(profileFields);
          await profile.save();
          console.log('created');
          res.json(profile);
      } catch (err) {
          console.error(err.message);
          res.status(500).send('server error');
      }
     
  }
);
//@route GET api/profile/
//@desc get all profiles
//@access public
router.get('/',async(req,res)=>{
    try {
        const profiles = await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('server error');
    }
});
//@route GET api/profile/user/:user_id
//@desc get profile by  id
//@access public
router.get('/user/:user_id',async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if (!profile) {
            return res.status(500).send('profile not found');
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind==='ObjectId') {
            return res.status(500).send('profile not found');
        }
        return res.status(500).send('servver error');
    }
});
//@route delete api/profile
//@desc delete profile,user & post
//@access public
router.delete('/',auth,async(req,res)=>{
    try {
         await Profile.findOneAndRemove({user:req.user.id});
         await User.findOneAndRemove({_id:req.user.id});
        
        res.json({msg:"user deleted"});
    } catch (err) {
        console.error(err.message);
       
        return res.status(500).send('servver error');
    }
});
//@route put api/profile/experience
//@desc add profile experience
//@access private
router.put('/experience',[auth,[
    check('title','title is required')
    .not()
    .isEmpty(),
    check('company','company is required')
    .not()
    .isEmpty(),
    check('from','from is required')
    .not()
    .isEmpty(),
  ]
],
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }= req.body;

    const newExp={
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id});

        profile.experience.unshift(newExp);

        await profile.save();
        
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
  }
);
//@route delete api/profile/experience/exp_id
//@desc delete profile experience
//@access private
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.user.id});

        const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
        
        profile.experience.splice(removeIndex,1);
        
        await profile.save();
        
        res.json(profile);
    } catch (error) {
        res.status(500).send('server error');
    }
});
//@route put api/profile/education
//@desc add profile education
//@access private
router.put(
    '/education',
    [auth,
        [
            check('school','school is required')
            .not()
            .isEmpty(),
            check('degree','degree is required')
            .not()
            .isEmpty(),
            check('fieldofstudy','field of stude is required')
            .not()
            .isEmpty(),
            check('from','from is required')
            .not()
            .isEmpty(),
  ]
],
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const{
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }= req.body;

    const newEdu={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id});

        profile.education.unshift(newEdu);

        await profile.save();
        
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
  }
);
//@route delete api/profile/education/exp_id
//@desc delete profile education
//@access private
router.delete('/education/:exp_id',auth,async(req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.user.id});

        const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id);
        
        profile.education.splice(removeIndex,1);
        
        await profile.save();
        
        res.json(profile);
    } catch (error) {
        res.status(500).send('server error');
    }
});
//@route delete api/profile/github/:username
//@desc get repos from github
//@access public
router.get('/github/:username', async (req, res) => {
    try {
      const uri = encodeURI(
        `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
      );
      const headers = {
        'user-agent': 'node.js',
        Authorization: `token ${config.get('githubToken')}`
      };
  
      const gitHubResponse = await axios.get(uri, { headers });
      return res.json(gitHubResponse.data);
    } catch (err) {
      console.error(err.message);
      return res.status(404).json({ msg: 'No Github profile found' });
    }
  });
module.exports = router;