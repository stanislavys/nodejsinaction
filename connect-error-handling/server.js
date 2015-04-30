var connect = require('connect');

function hello(req, res, next) {
	if (req.url.match(/^\/hello/)) {
		res.end('Hello World\n');
	} else {
		next();
	}
}

var db = {
	users: {
		admin : { name : 'Admin' },
		alice : { name : 'Alice'},
		bob : { name : 'Bob'}
	}
};

function users(req, res, next) {
	var match = req.url.match(/^\/user\/(.+)/)
	if (match) {
		var user = db.users[match[1]];
		if (user) {
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(user));
		} else {
			var err = new Error('User not found');
			err.notFound = true;
			next(err);
		}
	} else {
		next();
	}
}

function pets(req, res, next) {
	console.log('Inside pets with url', req.url);
	if (req.url.match(/^\/pet\/(.+)/)) {
		console.log('Pets match - calling foo');
		foo();
	} else {
		next();
	}
}

function errorHandler(err, req, res, next) {
	console.error('API error handler' + err.stack);
	res.setHeader('Content-Type', 'application/json');
	if (err.notFound) {
		res.statusCode = 404;
		res.end(JSON.stringify({ error: err.message }));
	} else {
		res.statusCode = 500;
		res.end(JSON.stringify({ error: 'Internal Server Error' }));
	}
	
	// Does not call next(err) so no other error handlers are invoked.
	// Uncomment to invoke next handlers - errorPage
	//next(err);
}

function devErrorHandler() {
	var env = process.env.NODE_ENV || 'development';
	return function(err, req, res, next) {
		res.statusCode = 500;
		switch (env) {
			case 'development':
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(err));
				break;
			default:
				res.end('Server error');
		}
	}
};

function errorPage(err, req, res, next) {
	console.error('Page error handler');
}

function triggerRuntimeError(req, res, next) {
	undefinedFunction();
}

function causeRuntimeError() {
	return triggerRuntimeError;
}
	
function runDefaultErrorHandler() {
	connect()
		.use(causeRuntimeError())
		.listen(3000);
}

function runMultipleErrorHandlers() {
	var api = connect()
		.use(users)
		.use(pets)
		.use(errorHandler);
	var app = connect()
		.use(hello)
		.use('/api', api)
		.use(errorPage)
		.listen(3000);	
}
	
//runDefaultErrorHandler();
runMultipleErrorHandlers();
