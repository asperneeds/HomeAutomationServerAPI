'use strict';
const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
// nodemailer.createTestAccount((err, account) => {

// 	// create reusable transporter object using the default SMTP transport
// 	let transporter = nodemailer.createTransport({
// 		host: 'smtp.gmail.com',
// 		port: 587,
// 		secure: false, // true for 465, false for other ports
// 		auth: {
// 			user: 'sales@ngxtechnologies.com', // generated ethereal user
// 			pass: 'welcomesales123' // generated ethereal password
// 		}
// 	});

// 	// setup email data with unicode symbols
// 	let mailOptions = {
// 		from: '"Sales"<sales@ngxtechnologies.com>', // sender address
// 		to: 'vinay.hpatil@gmail.com', // list of receivers
// 		subject: 'Hello ✔', // Subject line
// 		text: 'Hello world?', // plain text body
// 		html: '<b>Hello world11</b>' // html body
// 	};

// 	// send mail with defined transport object
// 	transporter.sendMail(mailOptions, (error, info) => {
// 		if (error) {
// 			return console.log(error);
// 		}
// 		console.log('Message sent: %s', info.messageId);
// 		// Preview only available when sending through an Ethereal account
// 		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

// 		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
// 		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// 	});
// });

let defaultOptions = {
	host: 'smtp.gmail.com',
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: 'sales@ngxtechnologies.com', // generated ethereal user
		pass: 'welcomesales123' // generated ethereal password
	}
}

const sendMail = function (options, mailOptions, callback) {


// create reusable transporter object using the default SMTP transport

if(options)
defaultOptions=options;
let transporter = nodemailer.createTransport(defaultOptions);
transporter.sendMail(mailOptions,callback);

}

exports.sendMail = sendMail;