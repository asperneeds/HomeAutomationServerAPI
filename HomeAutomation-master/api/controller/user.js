var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
let user = require('../models/user');
var JWT = require('jsonwebtoken');
var auth = require('./auth');
var sms = require('./sms');
var otp = require('./otp');
var OTP = require('../models/otp');
var expires = require('expires');
let Grid = require("gridfs-stream");
busboyBodyParser = require('busboy-body-parser');
var mail = require('./emailSend');
var async = require("async");
const passport = require('passport');
var Fbloging = require('../models/facebookloging');
var utils = require('./utils');
let gfs;
var userType = require('../models/userType');

//will change the user schema. comment to test git branching
router.use(busboyBodyParser({
	limit: '10mb'
}));

orgnMiddleware = (req, res, next) => {

	var dbname = auth.getOrgntoken(req);
	if (dbname === null || dbname === undefined || dbname === "") {
		res.status(400).json({
			message: "invalid organisation",
			responsecode: '0',
		});
	} else {
		// console.log("================================");
		// console.log(dbname);
		User = new user(dbname);
		Usertype = new userType(dbname);
		Otp = new OTP(dbname);
	
		next();
	}
}

router.post('/register', auth.authenticateOrgntoken, orgnMiddleware, function (req, res) {

	_atleastoneuserdetailsfound = false;
	if (req.body.usertype === undefined || req.body.usertype === "") {
		req.body.usertype = "user"
		req.body.accountstatus = "activated"
	}
	// if (req.body.usertype !== "default")
	// 	req.body.accountstatus = "Not Activated"

	console.log(req.body)

	_checkemail = (callback) => {
		if (req.body.email === "" || req.body.email === undefined || req.body.email === null)
			callback();
		else
			User.model.findOne({
				'email': req.body.email
			}, (err, result) => {
				if (result === null) {
					_atleastoneuserdetailsfound = true;
					callback();
				} else {
					//res.send('eMail ID already registered');
					res.status(400).json({
						message: "eMail ID already registered",
						responsecode: '0',
					});
				}

			})

	}

	_checkUserName = (callback) => {
		if (req.body.username === "" || req.body.username === undefined || req.body.username === null)
			callback();
		else
			User.model.findOne({
				'username': req.body.username
			}, (err, result) => {
				if (result === null) {
					_atleastoneuserdetailsfound = true;
					callback();
				} else {
					res.status(400).json({
						message: "UserName already registered",
						responsecode: '0',
					});
				}

			})

	}

	_checkMobile = (callback) => {
		if (req.body.mobile === "" || req.body.mobile === undefined || req.body.mobile === null)
			callback();
		else
			User.model.findOne({
				'mobile': req.body.mobile
			}, (err, result) => {
				if (result === null) {
					_atleastoneuserdetailsfound = true;
					callback();
				} else {
					res.status(400).json({
						message: "Mobile Number already registered",
						responsecode: '0',
					});
				}
			})

	}

	// _checkUserType = (callback) => {

	// 	Usertype.model.findOne({
	// 		'usertype': req.body.usertype
	// 	}, (err, result) => {
	// 		if (result === null) {
	// 			callback();
	// 		} else {
	// 			req.body.accountstatus = result.status
	// 			callback();

	// 		}
	// 	})

	// }

	

	_createUser = (callback) => {
		if (_atleastoneuserdetailsfound === true) {
			User.model.create(req.body, (err, result) => {
				if (err) {
					console.log(err);
					res.send(err);
				}
				res.json(result);
			})
		} else {
			res.status(400).json({
				message: "Either of email/mobile/username is required",
				responsecode: '0',
			});
		}
	}

	async.series([
		_checkemail,
		_checkUserName,
		_checkMobile,
		// _checkUserType,
		_createUser,
	], function (err, results) {
		console.info("info Test Completed".yellow)
		callback()
	});

});


router.post('/login', auth.authenticateOrgntoken, orgnMiddleware, function (req, res) {

	_findUser = (callback) => {
		if (req.body.user === "" || req.body.user === null || req.body.user === undefined) {
			res.status(400).json({
				message: "Invalid User/Password---1",
				responsecode: '0'
			});
		}

		User.model.findOne({
			$or: [{
					'username': req.body.user
				},
				{
					'mobile': req.body.user
				},
				{
					'email': req.body.user
				}
			]
		}, (err, user) => {
			if (user) {
				callback(null, user)
			} else {
				res.status(400).json({
					message: "Invalid User/Password---2",
					responsecode: '0',

				})
			}
		})
	}

	_verifypasswordORotp = (user, callback) => {
		console.log("password: ", req.body.password);
		console.log("otp : ", req.body.otp);
		if (req.body.password !== undefined) {
			if (user === null) {
				res.status(400).json({
					message: "Invalid User/Password----3",
					responsecode: '0'
				})

			} else if (user.password !== req.body.password) {
				res.status(400).json({
					message: "Invalid User/Password----4",
					responsecode: '0'
				})
			} else {

				callback(null, user)
			}


		} else if (req.body.otp !== undefined) {
			var userotp = {
				userid: user._id,
				mobile: req.body.mobile,
				otp: req.body.otp,
				otpexp: expires.after('2 minutes'),
				used: false
			}

			Otp.model.findOne({

				'userid': userotp.userid

			}, (err, result) => {
				if (result) {
					if (req.body.otp !== result.otp) {
						res.status(400).json({
							message: "otp error",
							responsecode: '0'
						});
					} else if (expires.expired(result.otpexp) === true) {
						res.status(400).json({
							message: "otp expired",
							responsecode: '0'
						});
					} else if (result.used === true) {
						res.status(400).json({
							message: "otp used",
							responsecode: '0'
						});
					} else {
						result.used = true;
						result.__v = undefined;
						Otp.model.findOneAndUpdate({

							'userid': result.userid

						}, result, (error, result) => {
							callback(null, user);
						});
					}
				} else {
					res.status(400).json({
						message: "Invalid User",
						responsecode: '0'
					});
				}


			});

		}
	}

	_tokensign = (user, callback) => {
		auth.tokensign(user)
			.then(result => {
				callback(null, result)
			})
	}

	_respond = (result, callback) => {

		res.send(result);
	}

	async.waterfall([
		_findUser,
		_verifypasswordORotp,
		_tokensign,
		_respond,
	], function (err, results) {

		console.info("info Test Completed".yellow)
		callback()
	});

});

router.post('/email/otp/:email', auth.authenticateOrgntoken, orgnMiddleware, function (req, res, next) {
	//var user = req.params.email;

	email = req.params.email;
	//console.log(user)

	_findUser = (callback) => { //finds the user and generates the otp and writes the otp in db collection
		User.model.findOne({
			$or: [{
					'username': email
				},
				{
					'mobile': email
				},
				{
					'email': email
				}
			]
		}, (err, user) => {
			// console.log("--------------------------------------");
			// console.log(user);
			if (!user) {
				res.status(400).json({
					message: "user not found",
					responsecode: '0'
				});
			}


			var userotp = {
				userid: user._id,
				email: req.params.email,
				otp: otp.otpGenerate(),
				otpexp: expires.after('2 minutes'),
				used: false
			}
			callback(null, userotp);


		});
	}

	_otpsave = (userotp, callback) => {

		Otp.model.findOneAndUpdate({

			'userid': userotp.userid

		}, userotp, (error, result) => {
			if (!result) {
				Otp.model.create(userotp, (err, result) => {
					if (err) {
						console.log(err);
						res.send(err);
					}
				});
			}
		});

		callback(null, userotp);

	}

	_sendmail = (doc, callback) => {
		// console.log("--------------------------------------",+doc.otp);
		// console.log(doc)
		otpmsg = "OTP : " + doc.otp + " \nYour OTP expire in 2 mins,Please do not share it with anyone for security reason.";


		let mailOptions = {
			from: '', // sender address
			to: req.params.email, // list of receivers
			subject: 'otp', // Subject line
			text: 'Hello world?', // plain text body
			html: '<b>' + otpmsg + '</b>' // html body
		};

		mail.sendMail(null, mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}

			res.status(200).send("mail sent");
			console.log('Message sent: %s', info.messageId);
			// Preview only available when sending through an Ethereal account
			console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
			// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
		});
	}
	//	res.status(200).send();

	async.waterfall([
		_findUser,
		_otpsave,
		_sendmail,

	], function (err, results) {

		console.info("info Test Completed".yellow)
		callback()
	});

});


router.post('/mobile/otp/:mobile', auth.authenticateOrgntoken, orgnMiddleware, function (req, res, next) {
	var mobile = req.params.mobile;

	_findUser = (callback) => { //finds the user and generates the otp and writes the otp in db collection
		User.model.findOne({
			$or: [{
					'username': mobile
				},
				{
					'mobile': mobile
				},
				{
					'email': mobile
				}
			]
		}, (err, user) => {
			if (!user) {
				res.status(400).json({
					message: "user not found",
					responsecode: '0'
				});
			} else {
				var userotp = {
					userid: user._id,
					mobile: req.params.mobile,
					otp: otp.otpGenerate(),
					otpexp: expires.after('2 minutes'),
					used: false
				}
				callback(null, userotp);
			}
		});
	}

	_otpsave = (userotp, callback) => {

		Otp.model.findOneAndUpdate({

			'userid': userotp.userid

		}, userotp, (error, result) => {
			if (!result) {
				Otp.model.create(userotp, (err, result) => {
					if (err) {
						console.log(err);
						res.send(err);
					}
				});
			}
		});
		callback(null, userotp);
	}

	_sendmobile = (doc, callback) => {
		otpmsg = "OTP : " + doc.otp + " \nYour OTP expire in 2 mins,Please do not share it with anyone for security reason.";
		sms.sendSms(otpmsg, req.params.mobile, () => {});
		res.status(200).send("otp sent");
	}


	async.waterfall([

		_findUser,
		_otpsave,
		_sendmobile,

	], function (err, results) {
		console.info("info Test Completed".yellow)
		callback();
	});

});

//veifies the token and sends back result
router.get('/authenticate', auth.authenticateOrgntoken, auth.authenticate, function (req, res) {
	res.status(200).json({
		status: 200
	});
});



router.post('/facebook', passport.authenticate('facebookToken', {
		session: false
	}), auth.authenticateOrgntoken, orgnMiddleware,
	function (req, res) {
		var _Userfound = false;
		console.log("email:  \n", req.user.emails[0].value);

		_findUser = (callback) => {
			if (req.user.emails[0].value !== "") {
				User.model.findOne({
					$or: [{
							'email': req.user.emails[0].value
						},
						{
							'facebookID': req.user.id
						}
					]

				}, (err, user) => {
					if (user) {
						console.log("user Found");
						_Userfound = true;
						callback(null, user);
					} else {
						user = req.user;
						callback(null, user);
					}
				})
			} else {

				User.model.findOne({
					'facebookID': req.user.id
				}, (err, user) => {
					if (user) {
						//	console.log("user Found");
						_Userfound = true;
						callback(null, user);
					} else {
						user = req.user;
						callback(null, user);
					}
				})
			}
		}

		_checkUserType = (user, callback) => {

			Usertype.model.findOne({
				'usertype': req.body.usertype
			}, (err, result) => {
				if (result === null) {
					callback(null, user);
				} else {
					req.body.accountstatus = result.status
					callback(null, user);
				}
			})

		}


		_createUser = (user, callback) => {
			if (_Userfound === false) {

				req.body.email = user.emails[0].value;
				req.body.facebookID = user.id;
				req.body.imageUrl = user.photos[0].value;
				req.body.firstname = user._json.first_name;
				req.body.lastname = user._json.last_name;
				//	req.body.usertype = "user";

				User.model.create(req.body, (err, result) => {
					if (err) {
						console.log(err);
						res.send(err);
					}
					User.model.findOne({
						'facebookID': req.user.id
					}, (err, user) => {
						if (user) {
							callback(null, user);
						}
					});
				})
			} else {
				if (user.facebookID === "" || user.facebookID === undefined) {
					user.facebookID = req.user.id;
					user.imageUrl = req.user.photos[0].value;
					user.save((err, user) => {
						if (err) {
							res.status(500).send(err)
						}
					});
				}
				callback(null, user);
			}
		}

		_tokensign = (user, callback) => {
			auth.tokensign(user)
				.then(result => {
					callback(null, result)
				})
		}

		_respond = (result, callback) => {

			res.send(result);
		}

		async.waterfall([
			_findUser,
			_checkUserType,
			_createUser,
			_tokensign,
			_respond,
		], function (err, results) {

			console.info("info Test Completed".yellow)
			callback()
		});
	});


router.post('/img', auth.authenticateOrgntoken, (req, res) => {
	console.log(req.files)
	let part = req.files.file;
	//console.log(User.gfs)
	let writeStream = User.gfs.createWriteStream({
		filename: 'img_' + part.name,
		mode: 'w',
		content_type: part.mimetype
	});

	writeStream.on('close', (file) => {
		// checking for file
		if (!file) {
			res.status(400).send('No file received');
		}
		return res.status(200).send({
			message: 'Success',
			file: file
		});
	});
	// using callbacks is important !
	// writeStream should end the operation once all data is written to the DB 
	writeStream.write(part.data, () => {
		writeStream.end();
	});

});

router.get('/img/:id', auth.authenticateOrgntoken, (req, res) => {
	let id = req.params.id;

	User.gfs.findOne({
		_id: id
	}, function (err, file) {
		console.log(file);
	})
	let data = [];
	let readstream = User.gfs.createReadStream({
		_id: id
	});

	readstream.on('data', (chunk) => {
		data.push(chunk);
	});

	readstream.on('end', () => {
		data = Buffer.concat(data);
		let img = 'data:image/png;base64,' + Buffer(data).toString('base64');
		res.end(img);
	});

	readstream.on('error', (err) => {
		// if theres an error, respond with a status of 500
		// responds should be sent, otherwise the users will be kept waiting
		// until Connection Time out
		res.status(500).send(err);
		console.log('An error occurred!', err);
	});

});




router.get('/', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res) {
	//  var id 
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	var id = auth.decode(token).sub;
	//   id.sub=auth.decode(token)
	console.log(id)
	User.model.findOne({
		"_id": id
	}, (err, prod) => {
		if (err) {
			console.log(err);
			res.send(err);
		}
		res.json(prod);
	});
});


router.post('/sendsms', auth.authenticateOrgntoken, auth.authenticate, function (req, res, next) {
	console.log(req.body)
	sms.sendSms(req.body.message, req.body.mobile, (resp) => {});
	res.status(200).send("sms sent");
})

router.put('/', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res, next) {
	var id = req.auth.id;
	User.model.findById(id, (err, user) => {
		// Handle any possible database errors
		if (err) {
			res.status(500).send(err);
		} else {
			// Update each attribute with any possible attribute that may have been submitted in the body of the request
			// If that attribute isn't in the request body, default back to whatever it was before.
			//   user.email = req.body.email || user.email;
			//  user.password = req.body.password || user.password;
			//user.username = req.body.username || user.username;
			//user.usertype = req.body.usertype || user.usertype;
			user.firstname = req.body.firstname || user.firstname;
			user.lastname = req.body.lastname || user.lastname;
			// user.mobile = req.body.mobile || user.mobile;
			user.telephone = req.body.telephone || user.telephone;
			user.alternatemobile = req.body.alternatemobile || user.alternatemobile;
			user.businessname = req.body.businessname || user.businessname;
			user.address = req.body.address || user.address;
			user.city = req.body.city || user.city;
			user.pin = req.body.pin || user.pin;
			user.state = req.body.state || user.state;
			user.country = req.body.country || user.country;
			user.profilepic = req.body.profilepic || user.profilepic;
			user.gps = req.body.gps || user.gps;
			//   user.email = req.body.email || user.email;

			// Save the updated document back to the database
			user.save((err, user) => {
				if (err) {
					res.status(500).send(err)
				}
				res.status(200).send(user);
			});
		}
	});
});
//})




router.get('/admin/get/:id', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res) {
	var id = req.params.id;
	ut = req.auth.usertype;
	console.log(id);
	__checkadmin = (callback) => {

		if (ut === 'Admin' || ut === 'admin' || ut === 'ADMIN') {
			callback()
		} else {
			res.status(400).json({
				message: "User not Admin",
				responsecode: '0'
			});
		}

	}

	__finduser = (callback) => {
		User.model.findOne({
			"_id": id
		}, (err, user) => {
			if (user) {
				console.log(user);
				res.json(user);
			} else {
				res.status(400).json({
					message: "User not Found",
					responsecode: '0'
				});
			}
		})

	}

	async.series([
		__checkadmin,
		__finduser,

	])
})

router.get('/admin/getusers', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res) {
	var page = parseInt(req.headers.page);
	var limit = parseInt(req.headers.limit);
	var query = (req.headers.query);

	ut = req.auth.usertype;

	//var query="{ \"username\": \"__REGEXP /\*/i\"}" ;

	console.log(query)

	__checkadmin = (callback) => {

		if (ut === 'Admin' || ut === 'admin' || ut === 'ADMIN') {
			callback()
		} else {
			res.status(400).json({
				message: "User not Admin",
				responsecode: '0'
			});
		}

	}

	__checklimit = (callback) => {

		if (limit > 100) {

			res.status(400).json({
				message: "Limit Exceed",
				responsecode: '0'

			});
		} else {
			callback();
		}
	}

	__getuser = (callback) => {

		if (query === undefined)
			queryobj = {};
		else
			queryobj = JSON.parse(query, utils.reviver)

		console.log(queryobj)

		User.model.paginate(queryobj, {
			page: page,
			limit: limit
		}, function (err, result) {
			if (err) {
				res.status(500).send(err)
			} else {
				res.send(result);
			}
		});

	}

	async.series([
		__checkadmin,
		__checklimit,
		__getuser,

	], function (err, results) {

		console.info("info Test Completed".yellow)
		callback()

	});

});

router.get('/query/:query', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res) {

	id = req.auth.id
	var query = req.query;
	console.log(query);
	var mobile = '',
		firstname = '',
		lastname = ''
	var count;
	for (var prop in query) {
		if (prop === "firstname")
			firstname = query[prop]
		if (prop === "mobile")
			mobile = query[prop]
		if (prop === "lastname")
			lastname = query[prop]
	}

	console.log(id);
	__finduser = (callback) => {
		User.model.findOne({
			"_id": id
		}, (err, user) => {
			if (user) {
				console.log(user);
				callback(null, user);
			} else {
				res.status(400).json({
					message: "User not Found",
					responsecode: '0'
				});
			}
		});
	}

	__findorgnusers = (user) => {
		User.model.find({
				$and: [{
						GSTN: user.GSTN
					},
					{
						firstname: {
							$regex: firstname
						}
					},
					{
						lastname: {
							$regex: lastname
						}
					},
					{
						mobile: {
							$regex: mobile
						}
					}
				]
			},
			(err, result) => {
				if (result) {
					console.log(result);
					res.json(result);
				} else {
					// res.status(200).send(queryarray);
					console.log(result);
					res.status(400).json({
						message: "User not Found",
						responsecode: '0'
					});
				}
			});
	}


	async.waterfall([
		__finduser,
		__findorgnusers

	], function (err, results) {
		console.info("info Test Completed".yellow)
		callback();
	});
})

router.put('/admin/:id', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res, next) {
	var id = req.params.id;
	ut = req.auth.usertype;

	__checkadmin = (callback) => {

		if (ut === 'Admin' || ut === 'admin' || ut === 'ADMIN') {
			callback()
		} else {
			res.status(400).json({
				message: "User not Admin",
				responsecode: '0'
			});
		}

	}


	__updateuser = (callback) => {

		User.model.findById(id, (err, user) => {
			if (err) {
				res.status(500).send(err);
			} else {

				user.firstname = req.body.firstname || user.firstname;
				user.lastname = req.body.lastname || user.lastname;
				user.telephone = req.body.telephone || user.telephone;
				user.alternatemobile = req.body.alternatemobile || user.alternatemobile;
				user.businessname = req.body.businessname || user.businessname;
				user.address = req.body.address || user.address;
				user.city = req.body.city || user.city;
				user.pin = req.body.pin || user.pin;
				user.state = req.body.state || user.state;
				user.country = req.body.country || user.country;
				user.profilepic = req.body.profilepic || user.profilepic;
				user.gps = req.body.gps || user.gps;

				user.save((err, user) => {
					if (err) {
						res.status(500).send(err)
					}
					res.status(200).send(user);
				});
			}
		});

	}

	async.series([
		__checkadmin,
		__updateuser,

	], function (err, results) {

		console.info("info Test Completed".yellow)
		callback()

	});
});

router.delete('/admin/:id', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res, next) {
	var user = req.params.id;
	ut = req.auth.usertype;

	__checkadmin = (callback) => {

		if (ut === 'Admin' || ut === 'admin' || ut === 'ADMIN') {
			callback()
		} else {
			res.status(400).json({
				message: "User not Admin",
				responsecode: '0'
			});
		}

	}
	__removeuser = (callback) => {

		User.model.remove({
			"_id": user
		}, (err, prod) => {
			if (err) {
				console.log(err);
				res.send(err);
			}
			res.json(prod);
		});
	}

	async.series([

		__checkadmin,
		__removeuser,

	], function (err, results) {

		console.info("info Test Completed".yellow)
		callback()

	});

});


router.put('/editpassword', auth.authenticateOrgntoken, auth.authenticate, orgnMiddleware, function (req, res, next) {
	var id = req.auth.id;
	//	console.log(id)

	__checkpreviouspassword = (callback) => {
		User.model.findOne({
			'_id': id
		}, (error, result) => {
			//	console.log(result);
			if (result === null) {
				res.status(400).json({
					message: "Wrong User",
					responsecode: '0'
				});
			} else {
				if (result.password === req.body.currentpassword)
					callback();
				else {
					res.status(400).json({
						message: "Wrong Password",
						responsecode: '0'
					});
				}
			}
		})

	}


	__updatenewpassword = (callback) => {

		User.model.findById(id, (err, user) => {
			if (err) {
				res.status(500).send(err);
			} else {
				user.password = req.body.newpassword || user.password;
				user.save((err, user) => {
					if (err) {
						res.status(500).send(err)
					}
					res.status(200).send(user);
				});
			}
		});
	}

	async.series([
		__checkpreviouspassword,
		__updatenewpassword,

	], function (err, results) {

		console.info("info Test Completed".yellow)
		callback()

	});
});

router.put('/forgetpassword', auth.authenticateOrgntoken, orgnMiddleware, function (req, res, next) {

	__checkmobile = (callback) => {
		User.model.findOne({

			'mobile': req.body.mobile

		}, (err, user) => {
			//	console.log(result);
			if (user === null) {
				res.status(400).json({
					message: "Wrong Mobile no.",
					responsecode: '0'
				});
			} else {
				callback(null, user);
			}
		})

	}


	__verifyOtp = (user, callback) => {

		var userotp = {
			userid: user._id,
			mobile: user.mobile,
			otp: req.body.otp,
			otpexp: expires.after('2 minutes'),
			used: false
		}

		Otp.model.findOne({

			'userid': userotp.userid

		}, (err, result) => {
			if (result) {
				if (req.body.otp !== result.otp) {
					res.status(400).json({
						message: "otp error",
						responsecode: '0'
					});
				} else if (expires.expired(result.otpexp) === true) {
					res.status(400).json({
						message: "otp expired",
						responsecode: '0'
					});
				} else if (result.used === true) {
					res.status(400).json({
						message: "otp used",
						responsecode: '0'
					});
				} else {
					result.used = true;
					result.__v = undefined;
					Otp.model.findOneAndUpdate({

						'userid': result.userid

					}, result, (error, result) => {
						callback(null, result);
					});
				}
			} else {
				res.status(400).json({
					message: "Invalid User",
					responsecode: '0'
				});
			}


		});


	}

	__updatepassword = (user, callback) => {
		var id = user.userid
		User.model.findById(id, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else {
				console.log(result)
				result.password = req.body.newpassword || result.password;
				result.save((err, result) => {
					if (err) {
						res.status(500).send(err)
					}
					res.status(200).send(result);
				});
			}
		});

	}

	async.waterfall([
		__checkmobile,
		__verifyOtp,
		__updatepassword,

	], function (err, results) {

		console.info("info Test Completed".yellow)
		callback()

	});
});


module.exports.router = router;