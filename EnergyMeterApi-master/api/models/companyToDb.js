mongoose = require('mongoose');
const Schema = mongoose.Schema;
var DB = require('../controller/dbcontroller');

const dbSchema = new Schema({
  
    companyName:String,
    shortId:String,
    dbName:String,
    subdomain:String,

});




module.exports = function (db) {
    console.log('connecting to db '+ db);
    db = DB.connectDb(db);
    dbModel = db.model('dblist', dbSchema)
   return { model : dbModel }
   
}