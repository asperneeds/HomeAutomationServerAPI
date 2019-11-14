var generator = require("generate-serial-number")
var request = require('request');
for(var i = 0; i < 200;i++){
var serialNumber = generator.generate(12); // '8380289275'
var key = generator.generate(12); // '8380289275'
console.log(serialNumber+','+key+','+'NBP100')
}
//console.log(generator.isValid(serialNumber))


