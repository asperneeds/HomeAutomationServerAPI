
module.exports.otpGenerate = () => {
    var val = Math.floor(1000 + Math.random() * 9000);
    return val.toString();
   
}