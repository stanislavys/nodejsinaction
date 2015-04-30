var connect = require('connect');

function setup(format) {
	var regexp = /:(\w+)/g;
	
	return function logger(req, res, next) {
		var str = format.replace(regexp, function(match, property){
			// property ->  first parenthesized submatch
			// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
			return req[property];
		});
		console.log(str);
		
		next();
	}
}

module.exports = setup;
