var expires = require('expires');
 
// Returns some timestamp like 1341151672247 
var timestamp = expires.after('2 seconds');
 
// Then it can be tested for expiration 
expires.expired(timestamp);  // false 
setTimeout(function() {
    expires.expired(timestamp);  // true 
}, 2500);