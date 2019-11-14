mongoose = require('mongoose');
const Schema = mongoose.Schema;
let Config = require('./Config').Config;
var DB = require('../controller/dbcontroller')

const UsertypeSchema = new Schema({

    usertype: String,
    status: String

});

module.exports = function (db) {
    if (db === undefined) {
        console.log('connecting to db ' + Config.DefaultDB);
        db = DB.connectDb(Config.DefaultDB)
    } else
        db = DB.connectDb(db)

    UsertypeModel = db.model('usertype', UsertypeSchema)
    return {
        model: UsertypeModel
    }
}