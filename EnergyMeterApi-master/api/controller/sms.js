var http = require('http');
var urlencode = require('urlencode');
var username='vinay.hpatil@gmail.com';
var hash='2BV99ec072'; // The hash key could be found under Help->All Documentation->Your hash key. Alternatively you can use your Textlocal password in plain text.
 
var sender='txtlcl';


 
callback = function(response) {
  var str = '';
 
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
 
  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
  });
}
exports.sendSms= function(msg,number,callback){
    var data='username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+number+'&message='+urlencode(msg);
    var options = {
        host: 'api.textlocal.in',
        path: '/send?'+data
      };
    http.request(options, callback).end();
}
//http.request(options, callback).end();