mongoose = require('mongoose');
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
var DB = require('../controller/dbcontroller');
let Config = require('./Config').Config;
var mongoosePaginate = require('mongoose-paginate');

const UserSchema = new Schema({

  email: String,
  password: String,
  username: String,
  usertype: String,
  firstname: String,
  lastname: String,
  facebookID: String,
  imageUrl: String,
  mobile: String,
  address: String,
  city: String,
  pin: String,
  state: String,
  country: String,
  profilepic: String,
  gps: String,
  accountstatus: String,

});

UserSchema.plugin(mongoosePaginate);

module.exports = function (db) {
  // console.log("------------------------")
  // console.log(db);
  if (db === undefined) {
    console.log('connecting to db ' + Config.DefaultDB);
    db = DB.connectDb(Config.DefaultDB)
  } else {
    console.log('connecting to db ' + db);
    db = DB.connectDb(db)
  }
  UserModel = db.model('user', UserSchema)
  return {
    model: UserModel
  }
}