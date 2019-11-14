var express = require('express');
const router = express.Router();
//route path
var user = require('../controller/user');
var dbtoken = require('../controller/dbToken');
var deviceList = require('../controller/Devicelist');
var deviceShare = require('../controller/deviceshare');

var config = 'hello';

//URL
router.use('/user', user.router);
router.use('/dbtoken', dbtoken.router);
router.use('/devicelist', deviceList.router);
router.use('/deviceshare', deviceShare.router);


router.get('/', (req, res) => {
  const customer = req.body;
  console.log(customer);
  console.log("hello");
});

router.post('/', (req, res) => {
  const customer = req.body;
  console.log(customer);
  console.log("hello");
});






module.exports = router;