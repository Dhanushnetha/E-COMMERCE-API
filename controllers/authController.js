const User = require("../models/User")
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors')
const { attachCookiesToResponse, createTokenUser } = require("../utils")

const register = async (req,res)=>{
    const {name, email, password} = req.body;
    const emailDup = await User.findOne({email})
    if(emailDup){
        throw new customError.BadRequestError('Email Already Exists')
    }

    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({name, email, password, role})
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user:tokenUser})
    res.status(StatusCodes.CREATED).json({user: tokenUser})
}

const login = async (req,res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        throw new customError.BadRequestError('Please enter both Values')
    }
    const user = await User.findOne({email})
    if(!user){
        throw new customError.UnauthenticatedError('Invalid Credentials')
    }
    const isPasswordCorrect = await user.comparePassword(password);
    // console.log(isPasswordCorrect)
    if(!isPasswordCorrect){
        throw new customError.UnauthenticatedError('Invalid Credentials')
    }
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user:tokenUser})
    res.status(StatusCodes.OK).json({user: tokenUser})
}

const logout = async (req,res)=>{
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({msg: 'User logged out'})
}

module.exports = {
    register,
    login,
    logout
}