var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
busboyBodyParser = require('busboy-body-parser');
app.use(busboyBodyParser({
	limit: '10mb'
}));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

var router = require('./api/routes/routes');
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.header("Access-Control-Allow-Headers", "*,page,limit,file, Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, x-access-token,x-access-orgntoken,X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headerst");
	next();
});

app.use('/api/app', router);

app.post('/', (req, res) => {
	const customer = req.body;
	console.log(req.files)
	console.log("hello");
	res.send('Hello')
});


var temp;
app.listen(3008, () => {
	console.log("started on port 3008");
});

// server.listen(3000, function () {
// 	console.log('listening on *:3000');
// });


// io.on('connection', function (socket) {
// 	console.log('a user connected');
// 	console.log(socket.id)
// 	temp = socket;

// 	socket.on('disconnect', function (socket) {
// 		console.log('a user disconnected');
// 		console.log(socket.id)
// 	});
// 	socket.on('Reg', function (data) {
// 		//console.log('in CH01');
// 		console.log(data);

// 		setTimeout(function () {
// 			//temp.e

// 			//temp.emit('receivedMessage', "hello")

// 			//console.log(io.clients().clients);
// 			if (temp !== undefined && io.to(temp.id).connected[temp.id] !== undefined) {
// 				console.log(' emiting');
// 				io.to(temp.id).emit('Message', "Hellow World");
// 			} else
// 				console.log('not emiting');


// 		}, 5000);

// 	});

// 	socket.emit('receivedMessage', "hello")
// });