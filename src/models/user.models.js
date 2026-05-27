import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const userSchema = new mongoose.Schema(
    {
        username : {
            type : String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email:{
            type: String,
            required : true,
            unique : true,
            lowercase: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar : {
            type: String,    //cloudnary url
            required: true,
        },
        coverImage : {
            type: String,
        },
        watchHistory : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        password : {
            type : String,
            required : [true, "Password is required"],
        },
        refreshToken : {
            type : String,
        }
    },{timsestamps : true}
);

//pre refers to pre-save or pre-hook middleware.
//These are functions that execute before a specific database operation (like saving, updating, or deleting a document) takes place.
userSchema.pre("save", async function (next) {           //for saving password only if it is modified
    if(!this.isModified("password")) { return next(); }

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign(                //syntax : jwt.sign(payload, secretKey, [options, callback]) 
        {                    // payload is an object
            _id: this._id,
            email: this.email,
            username: this.username,  
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,           //secretKey is string 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY     //another object 
        }
        //jwt.sign() : generates a token which is stored in generateAccessToken in userSchema.methods
    )
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign(                 //syntax : jwt.sign(payload, secretKey, [options, callback])
        {                     //payload is an object
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,         //secretKey is string 
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY     //another object
        }
    )
    //jwt.sign() : generates a token which is stored in generateRefreshToken in userSchema.methods
} 

export const User = mongoose.model('User',userSchema);
