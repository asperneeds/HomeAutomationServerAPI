var request = require('request');




// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded',
    'x-access-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJOR1ggc2VydmljZSIsInN1YiI6IjVhNWM5NWQ4ZDQ5N2NmNTAzOGQ5YzczNCIsImlhdCI6MTUxNjM2MzY1NDI0NCwiZXhwIjoxNTIxNTQ3NjU0MjQ0fQ.seZYUlpqCVOZFmnLXFa7hBzBi72OpsruSxhN2By0UAI'
}

// Configure the request
// var options = {
//     url: 'http://localhost:3005/api/v1/serialnkey/getkey/847898246370',
//     method: 'GET',
//     headers: headers,
  
// }
//db.users.find({mobile:"9886330804"}).pretty()  //"5a71a739b50f8819619cd380" //user:mobile:9886330804
//db.products.find().pretty() //"5a5ae4dae060250d402e6509" //product:id

var options = {
 //   url: 'http://localhost:3005/api/v1/productregistration/',
 url: 'http://45.77.128.23:3005/api/v1/productregistration/',
    method: 'POST',
    headers: headers,
    form:{
        customer:"5a71a739b50f8819619cd380",
        product:"5a5ae4dae060250d402e6509",
        serialNumber:"944624706221",
        productModel:"NPB100-T",
    }
  
}


var options1 = {
    //   url: 'http://localhost:3005/api/v1/productregistration/',
    url: 'http://45.77.128.23:3005/api/v1/productregistration/getregisteredproducts/5a71a739b50f8819619cd380',
       method: 'get',
       headers: headers,
       form:{
           customer:"5a71a739b50f8819619cd380",
           product:"5a5ae4dae060250d402e6509",
           serialNumber:"944624706221",
           productModel:"NPB100-T",
       }
     
   }

// Start the request
request(options1, function (error, response, body) {
    console.log(body)
    console.log(response.statusCode)
    if (!error && response.statusCode == 200) {
        // Print out the response body
       // console.log(body)
    }
})

//request.post({headers:headers,url:})