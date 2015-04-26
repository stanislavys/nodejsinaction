var connect = require('connect');

function logger(req, res, next) {
	console.log('%s %s', req.method, req.url);
	next();
}

function helloWorld(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.end('hello world');
}

function authenticateUser(user, pass, cb) {
	if (user.indexOf('admin') == 0) {
		cb();
	} else {
		cb(new Error('Wrong username or password.'));
	}
}

function restrict(req, res, next) {
	var authorization  = req.headers.authorization;
	if (!authorization) {
		return next(new Error('Unauthorized'));
	}
	
	var parts = authorization.split(' ');
	var scheme = parts[0];	// Basic
	var auth = new Buffer(parts[1], 'base64').toString().split(':');
	var user = auth[0];
	var password = auth[1];
	
	authenticateUser(user, password, function(err) {
		if (err) {
			return next(err);
		}
		
		next();
	});
}

function adminConsole(req, res, next) {
	switch (req.url) {
		case '/': {	// relative to mount point
			res.end('try /users');
			break;
		}
		case '/users': { // relative to mount point
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(['admin', 'alice', 'bob']));
			break;
		}
	}
}

connect()
	.use(logger)
	.use('/admin', restrict)
	.use('/admin', adminConsole)
	.use(helloWorld)
	.listen(3000);
