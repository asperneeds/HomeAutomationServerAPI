mongoose = require('mongoose');
//var validateUser = require('./user.validate');
const Schema = mongoose.Schema;
var DB = require('../controller/dbcontroller')
let Config=require('./Config').Config;

const OtpSchema = new Schema({
    userid: String,
    otp: String,
    password: String,
    otpexp: String,
    used:Boolean,
});

module.exports = function (db) {
    // console.log("------------------------")
    // console.log(db);
    if (db===undefined)
    {
      console.log('connecting to db '+ Config.DefaultDB);
      db = DB.connectDb(Config.DefaultDB)
    }
    else
      db = DB.connectDb(db)
  
      OtpModel = db.model('Otp', OtpSchema)
    return {
      model: OtpModel
    }
  }