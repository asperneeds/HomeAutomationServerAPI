mongoose = require('mongoose');


var connections = {};
module.exports.connectDbMW = function (req,res,next) {
  let dbName=  req.db;
	if (connections[dbName]) {
		//database connection already exist. Return connection object
        req.db= connections[dbName];
	} else {
		connections[dbName] = mongoose.createConnection('mongodb://localhost:27017/' + dbName);
        req.db= connections[dbName];
    }
    next();
}


module.exports.connectDb = function (dbName) {
    //  req.db=
      if (connections[dbName]) {
          //database connection already exist. Return connection object
          db= connections[dbName];
      } else {
          connections[dbName] = mongoose.createConnection('mongodb://localhost:27017/' + dbName);
          db= connections[dbName];
      }
     return db;
  }
  