var express = require('express');
var app = express();
var router = express.Router();
var auth = require('./auth');
var async = require("async");
let device = require('../models/devicelist');


orgnMiddleware = (req, res, next) => {

    var dbname = auth.getOrgntoken(req);
    if (dbname === null || dbname === undefined || dbname === "") {
        res.status(400).json({
            message: "invalid organisation",
            responsecode: '0',
        });
    } else {
        Device = new device(dbname);
        next();
    }
}


router.post('/', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res) {
  
    _checkDublicate = (callback) => {
        Device.model.findOne({
            $and: [{
                'userId': req.auth.id
            }, {
                'macId': req.body.macId
            }]

        },(err, result) => {
            if (result === null) {
                callback();
            } else {
                res.status(400).json({
                    message: "Device already in list",
                    responsecode: '0',
                });
            }

        })
    }

    _addDevice = (callback) => {
        req.body.date = new Date(new Date().getTime());
        req.body.userId = req.auth.id;
        Device.model.create(req.body, (err, result) => {
            if (err) {
                console.log(err);
                res.send(err);
            }
            res.json(result);
        })

    }

    async.series([
        _checkDublicate,
        _addDevice,
    ], function (err, results) {
        console.info("info Test Completed".yellow)
        callback()
    });
});


router.get('/query/:query',auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, (req, res) => {
    var query = req.query;
    var queryarray = [];
    
    for (var prop in query) {
        console.log("prop : " + prop);
        query1 = '{' + '\"' + prop + '\"' + ':' + '\"' + query[prop] + '\"' + '}';
        query1 = JSON.parse(query1);
        queryarray.push(query1);
    }
    query1 = '{' + '\"' + 'userId' + '\"' + ':' + '\"' + req.auth.id + '\"' + '}';
    query1 = JSON.parse(query1);
    queryarray.push(query1);

    var query = {
        $and: []
    }
    query.$and = queryarray;

    console.log("query :",query)
    _getDevicelist = (callback) => {
        Device.model.find(
           query, 
            (error, result) => {
                if (result === null) {
                    res.status(401).json({
                        message: "Device not found",
                        responsecode: '0',
                    });
                } else {
                    res.json(result);
                }
               
            })

    }

    async.series([

        _getDevicelist,

    ], function (err, results) {
        console.info("info Test Completed".yellow)
        callback()
    });

});


router.put('/', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res, next) {
    Device.model.findOne({
        'macId': req.body.macId
    }, (err, user) => {
          if (err) {
            res.status(500).send(err);
        } else {
           
            user.deviceName = req.body.deviceName || user.deviceName;
            user.macId = req.body.macId || user.macId;
            user.deviceName = req.body.deviceName || user.deviceName;
            user.deviceType = req.body.deviceType || user.deviceType;
            user.SSID = req.body.SSID || user.SSID;
            user.arr = req.body.arr || user.arr;
            user.save((err, user) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.status(200).send(user);
            });
        }
    });
});


module.exports.router = router;