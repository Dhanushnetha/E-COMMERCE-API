const User = require("../models/User")
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors')
const {createTokenUser, attachCookiesToResponse, checkPermissions}  = require('../utils')

const getAllUsers = async (req, res)=>{
    // console.log(req.user);
    const user = await User.find({role: 'user'}).select('-password')
    res.status(StatusCodes.OK).json({count: user.length, user})
}

const getSingleUser = async (req, res)=>{
    const { id } =  req.params
    const user = await User.findOne({_id: id }).select('-password');
    if (!user){
        throw new customError.NotFoundError(`No user with ${id}`);
    }
    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res)=>{
    res.status(StatusCodes.OK).json({user: req.user})
}

const updateUser = async (req, res)=>{
    const {email, name} = req.body;
    if(!email || !name){
        throw new customError.BadRequestError('Please enter both Values')
    }
    const user = await User.findOne({_id: req.user.userId})
    user.email = email;
    user.name = name;
    await user.save();

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser})
    res.status(StatusCodes.OK).json({user: tokenUser});
}

const updateUserPassword = async (req, res)=>{
    const { oldPassword, newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new customError.BadRequestError('Please enter both Values')
    }
    // console.log(req.user)
    const user = await User.findOne({_id: req.user.userId})

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if(!isPasswordCorrect){
        throw new customError.UnauthenticatedError('Invalid Credentials')
    }
    user.password = newPassword;
    // await User.findOneAndUpdate({email},{
    //     password : updatedPassword
    // })
    await user.save();
    res.status(StatusCodes.CREATED).json({msg: `Success! Password updated`})
}


module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}

// const updateUser = async (req, res)=>{
//     const {email, name} = req.body;
//     if(!email || !name){
//         throw new customError.BadRequestError('Please enter both Values')
//     }
//     const user = await User.findOneAndUpdate(
//         {_id: req.user.userId},
//         {email,name},
//         {new: true, runValidators: true}
//     );
//     const tokenUser = createTokenUser(user);
//     attachCookiesToResponse({res, user: tokenUser})
//     res.status(StatusCodes.OK).json({user: tokenUser});
// }