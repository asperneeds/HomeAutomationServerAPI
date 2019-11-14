mongoose = require('mongoose');
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
var DB = require('../controller/dbcontroller');
let Config = require('./Config').Config;
var mongoosePaginate = require('mongoose-paginate');

const deviceSchema = new Schema({

  userId:ObjectId,
  macId:String,
  date:Date,
  deviceName:String,
  switches_count:String,
  SSID:String,
  switch_arr : [String]  
  
});

deviceSchema.plugin(mongoosePaginate);

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
  DeviceModel = db.model('device', deviceSchema)
  return {
    model: DeviceModel
  }
}