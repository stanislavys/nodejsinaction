var connect = require('connect');
var logger = require('./logger');
var router = require('./router');

function authenticateUser(user, pass, cb) {
	if (user.indexOf('admin') == 0) {
		cb();
	} else {
		cb(new Error('Wrong username or password.'));
	}
}

var userRoutes = {
	GET: {
		'/users': function(req, res) {
			res.end(['admin', 'alice', 'bob'].join(', '));
		},
		'/user/:id': function(req, res, id) {
			res.end('user' + id);
		}
	},
	DELETE: {
		'/user/:id' : function(req, res, id){
			res.end('deleted user ' + id);
		}		
	}
}

connect()
	.use(logger(':method :url'))
	.use('/admin', router(userRoutes)) //mount at '/admin'
	.listen(3000);
