module.exports.replacer=(key, value) =>{
    if (value instanceof RegExp)
      return ("__REGEXP " + value.toString());
    else
      return value;
  }
  
  module.exports.reviver=(key, value) => {
    if (value.toString().indexOf("__REGEXP ") == 0) {
      var m = value.split("__REGEXP ")[1].match(/\/(.*)\/(.*)?/);
      return new RegExp(m[1], m[2] || "");
    } else
      return value;
  }

  function replacer(key, value) {
    if (value instanceof RegExp)
      return ("__REGEXP " + value.toString());
    else
      return value;
  }
  
