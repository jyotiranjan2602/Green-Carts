import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


//Register User :/api/user/register
export const register = async(req, res)=>{
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.json({success:false , message:'Missing Details.'})
        }
        const existingUser = await User.findOne({email})
         if(existingUser)
            return res.json({success:false, message:'user already Exists '})

         const hasedPassword = await bcrypt.hash(password,10)

         const user = await User.create({name, email, password: hasedPassword})
         const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn:'7d'})
         res.cookie('token', token, {
            httpOnly :true, //prevent JavaScript to access cookie
            secure : process.env.NODE_ENV === 'production', //use secure cookie in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none':'strict' , // CSRF protection
            maxAge: 7*24*60*60*1000, //cookie  expire time
         })
         return res.json({success:true, user:{email:user.email, name:user.name}})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message});
    }
}

// Login User : /api/user/login

export const login = async (req, res)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password)
            return res.json({success:false, message:'email and password are required'})
        const user = await User.findOne({email});
        if(!user){
            return res.json({success:false, message:'Invalid mail or password'});
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch)
            return res.json({success:false, message:'Invalid email or password'});
        const token= jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token',token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
            maxAge: 7*24*60*60*1000,
        })
        return res.json({success:true, user:{email:user.email, name:user.name}})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message});
    }
}

//Check Auth : /api/user/is-auth

export const isAuth = async (req, res) => {
    try {
      const userId = req.userId;
  
      if (!userId) {
        return res.json({ success: false, message: "User ID missing" });
      }
  
      const user = await User.findById(userId).select("-password");
  
      return res.json({ success: true, user });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
  };
//logout user :/api/user/logout

export const logout = async(req, res)=>{
    try {
        res.clearCookie('token', {
            httpOnly:true,
            secure : process.env.NODE_ENV ==='production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

        });
        return res.json({success:true, message:'Logged out'});
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message});
    }
}