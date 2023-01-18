const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'Please provide name'],
        minlength:5,
        maxlength: 50,
    },
    email:{
        type: String,
        required:[true, 'Please provide email'],
        validate:{
            validator: validator.isEmail,
            message: 'Please provide valid email'
        }
    },
    password:{
        type: String,
        required:[true, 'Please provide password'],
        minlength:6
    },
    role:{
        type:String,
        enum:['admin', 'user'],
        default: 'user'
    }
})

userSchema.pre('save', async function (){
    //console.log(this.modifiedPaths());
    //console.log(this.isModified('password'));
    if(!this.isModified('password')) return; 
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

// userSchema.methods.createJWT = async function(){
//     const tokenUser = {name: this.name, userId:this._id, role:this.role}
//     return jwt.sign(tokenUser, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
// }

module.exports = mongoose.model('User', userSchema)