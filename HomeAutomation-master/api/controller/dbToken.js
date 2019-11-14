var http = require('http');
var express = require('express');
var app = express();
var router = express.Router();
var JWT = require('jsonwebtoken');
var db = require('./dbcontroller');
var masterdbNewApp= require("../models/companyToDb");

orgnMiddleware = (req, res, next) => {

    masterDbNewApp =new masterdbNewApp('masternewdb');
    next();
}

router.post('/',orgnMiddleware, (req, res) => {
    console.log(req.body);
    
    masterDbNewApp.model.create(req.body,(err,doc)=>{
            if (err) {
                console.log(err);
                res.send(err);
            }
            res.json(doc);
    
        })
    })

router.get('/:id',orgnMiddleware, (req, res) => {
    var id=req.params.id;
    console.log(id)
   
    masterDbNewApp.model.findOne({"shortId":id}, (err, user) => {
        if (user) {

            tokensign(user)
            .then(result=>{ 
                console.log(result);
                res.json(result);
             })

        } else {

            res.status(400).json({
                message: "Invalid ID",
                responsecode: '0'
            })
        }
    });
   
});
   
router.get('/subdomain/:domain',orgnMiddleware, (req, res) => {
  
    var domain=req.params.domain;
    console.log("==============================");
    console.log(domain);
    masterDbNewApp.model.findOne({ 
            "subdomain":domain 
        }, (err, user) => {
        if (user) {

            tokensign(user)
            .then(result=>{ 
                console.log(result);
                res.json(result);
             })

        } else {

            res.status(400).json({
                message: "Invalid Domain",
                responsecode: '0'
            })
        }
    });
   
});

const tokensign = function (user) {    
    const p = new Promise((resolve, reject) => {
            JWT.sign({
                    iss: 'NGX service',
                    shortId: user.shortId,
                    dbName: user.dbName,
                    iat: new Date().getTime(),
                    exp: new Date().setDate(new Date().getDate() + 60)
                },
                'NGX Auth', {},  
                (err, token) => {
                    if (err)
                        throw new Error('token sign error');
                    else {
                        result = {
                            orgntoken: token,
                        }
                        resolve(result)
                    }
                })
    
        })
        return p;
    }

module.exports.router = router;