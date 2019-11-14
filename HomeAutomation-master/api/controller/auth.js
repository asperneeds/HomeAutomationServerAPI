var bodyParser = require('body-parser');
var JWT = require('jsonwebtoken');
let user = require('../models/user');
var Otp = require('../models/otp')
var expires = require('expires');
var  jwt_decode =require( 'jwt-decode');

orgnMiddleware = (req, res, next) => {
	User = new user();
	next();
}
const verifytoken = function (token) {
    const p = new Promise((resolve, reject) => {
        JWT.verify(token, 'NGX Auth', function (err, token) {
            if (err) {
                console.log('token error')
                var err=new Error('token error');
                err.code=400;
                throw err ;
            } else {
                resolve(token)
            }

        })
    })
    return p;
}

const decode = function (token) {
    // console.log("in authenticate")
    decoded = jwt_decode(token);
    return decoded;
 
 }
const respond = function (result) {

    return function (res) {
        res.status(200).json(result)
    }
    //  console.log("token:" + _token)
}



const onError = function (error) {
    return function (res) {
        res.status(error.code).json({
            message: error.message,
            responsecode:'0'
        })
    }
 //   console.log("error:" + error)
}

// const verifypassword = function (user) {

//     return function (req) {

//         const p = new Promise((resolve, reject) => {
//             if (user === null)
//             {
//             var err=new Error('invalid username/password');
//             err.code=401;
//             throw err;
//             }
//             else if (user.password !== req.body.password) {
//                 var err=new Error('invalid username/password');
//                 err.code=401;
//                 throw err;
//             } else {

//                 resolve(user);
//             }
//         })
//         return p;
//     }


//}
const tokensign = function (user) {
    const p = new Promise((resolve, reject) => {
        JWT.sign({
                iss: 'NGX service',
                sub: user._id,
                usertype:user.usertype,
                iat: new Date().getTime(),
                exp: new Date().setDate(new Date().getDate() + 60)
            },
            'NGX Auth', {},
            (err, token) => {
                if (err)
                {
                    var err=new Error('token sign error');
                    err.code=401;
                    throw newerr;
                }
                else {
                    result = {
                        token: token,
                        userId: user._id,
                        accountstatus: user.accountstatus,
                        responsecode:'1'

                    }
                    resolve(result)
                }
            })

    })
    return p;
}




const authenticate = function (req, res, next) {
    console.log("in authenticate")
    
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    req.auth={id:decode(token).sub,usertype:decode(token).usertype};
    verifytoken(token)
        .then(token => {
            next()})
        .catch((err) => onError(err)(res))

}

const authenticateOrgntoken = function (req, res, next) {
    console.log("in authenticate")
    var token = req.headers['x-access-orgntoken'];
    verifytoken(token)
        .then(token => next())
        .catch((err) => onError(err)(res))

}

// const Login = function (req, res, next) {
// console.log(req.headers)
//         getUser(req.body, res)
//         .then(user => verifypassword(user)(req))
//         .then(user => tokensign(user))
//         .then(result => respond(result)(res))
//         .catch((err) => onError(err)(res));
// }


 const OtpLogin = function(req,res)   {
      user = {
        user: req.body.mobile
    }
    var userg;
    User.getUser(user, res)
    .then(user=>{
        //console.log(user);
        userg=user;
       if(!user)
       throw Error("user not found")
       return Otp.getUserOtpDoc(user._id)
           
    })
    .then((_user)=>{
        //console.log(_user);
     if(req.body.otp!==_user.otp)
     throw Error("otp error");
     if(expires.expired(_user.otpexp)===true)
     throw Error("otp expired");
     if(_user.used===true)
     throw Error("otp used");


   _user.used=true;
    _user.__v=undefined;
   console.log(_user)
    return Otp.Save(_user)
   })
   .then(user_ =>tokensign(userg))
   .then(result => respond(result)(res))
   .catch((err) =>onError(err)(res));
 };



const getOrgntoken=function (req){
    var token = req.body.token || req.query.token || req.headers['x-access-orgntoken'];
    var dbName = decode(token).dbName;
    return dbName
}

exports.decode = decode;


//exports.verifyNdecode = verifyNdecode;

exports.tokensign = tokensign;
exports.OtpLogin = OtpLogin;
//exports.Login = Login;
exports.authenticate = authenticate;
//exports.verifypassword = verifypassword;
exports.onError = onError;
exports.respond = respond;
exports.verifytoken = verifytoken;
exports.authenticateOrgntoken=authenticateOrgntoken;
exports.getOrgntoken=getOrgntoken;
