mongoose = require('mongoose');
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
var DB = require('../controller/dbcontroller');
let Config = require('./Config').Config;
var mongoosePaginate = require('mongoose-paginate');

const devicetagSchema = new Schema({

  creator:ObjectId,
  macId:String,
  share:ObjectId,
  date:Date

});

devicetagSchema.plugin(mongoosePaginate);

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
  DevicetagModel = db.model('deviceshare', devicetagSchema)
  return {
    model: DevicetagModel
  }
}