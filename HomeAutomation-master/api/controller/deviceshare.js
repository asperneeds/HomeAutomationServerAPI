var express = require('express');
var app = express();
var router = express.Router();
var auth = require('./auth');
var async = require("async");
let device = require('../models/deviceshare');
let devicelist = require('../models/devicelist');
let user = require('../models/user');

orgnMiddleware = (req, res, next) => {

    var dbname = auth.getOrgntoken(req);
    if (dbname === null || dbname === undefined || dbname === "") {
        res.status(400).json({
            message: "invalid organisation",
            responsecode: '0',
        });
    } else {
        Device = new device(dbname);
        User = new user(dbname);
        Devicelist = new devicelist(dbname);
        next();
    }
}


router.post('/', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res) {
    id = req.auth.id
    _findUser = (callback) => {
        User.model.findOne({
            'mobile': req.body.share
        }, (err, user) => {
            if (user === null) {
                res.status(400).json({
                    message: "Mobile Not Found",
                    responsecode: '0',
                });
            } else {
                console.log(user);
                req.body.share = user._id;
                callback();
            }
        })
    }

    _checkDevice = (callback) => {
        Devicelist.model.findOne({
            'macId': req.body.macId
        }, (err, result) => {
            if (result === null) {
                res.status(401).json({
                    message: "Device Not Found",
                    responsecode: '0',
                });
            } else {
                console.log(result);
                console.log(id);
                id1 = result.userId;
                if (result.userId.equals(id)) {
                    callback();
                } else {
                    res.status(401).json({
                        message: "Device not for User",
                        responsecode: '0',
                    });
                }
            }
        })
    }

    _checkDublicate = (callback) => {
        Device.model.findOne({
            $and: [{
                'share': req.body.share
            }, {
                'macId': req.body.macId
            }]

        }, (err, result) => {
            if (result === null) {
                callback();
            } else {
                res.status(402).json({
                    message: "Device already share",
                    responsecode: '0',
                });
            }
        })
    }

    _addDevice = (callback) => {
        req.body.date = new Date(new Date().getTime());
        req.body.creator = req.auth.id;
        Device.model.create(req.body, (err, result) => {
            if (err) {
                console.log(err);
                res.send(err);
            }
            res.json(result);
        })
    }

    async.series([
        _findUser,
        _checkDevice,
        _checkDublicate,
        _addDevice,
    ], function (err, results) {
        console.info("info Test Completed".yellow)
        callback()
    });
});


router.get('/query/:query', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, (req, res) => {
    var query = req.query;
    var queryarray = [];
    for (var prop in query) {
        if (prop === 'creator')
            query1 = '{' + '\"' + prop + '\"' + ':' + '\"' + req.auth.id + '\"' + '}';
        else
            query1 = '{' + '\"' + prop + '\"' + ':' + '\"' + query[prop] + '\"' + '}';
        query1 = JSON.parse(query1);
        queryarray.push(query1);
    }

    var query = {
        $and: []
    }
    query.$and = queryarray;

    console.log("query :", query);

    _getDevice = (callback) => {
        Device.model.find(
            query,
            (error, result) => {
                res.json(result);
            })


    }

    async.series([

        _getDevice,

    ], function (err, results) {
        console.info("info Test Completed".yellow)
        callback()
    });

});


//})







module.exports.router = router;