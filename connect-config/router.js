var parseUrl = require('url').parse;

module.exports = function route(routeTable) {
	return function route(req, res, next) {
		if (!routeTable[req.method]) {
			next();
			return;
		}
		
		var routes = routeTable[req.method];
		var url = parseUrl(req.url);
		var paths = Object.keys(routes);
		
		for (var i = 0; i < paths.length; i++) {
			var path = paths[i];
			var routeHandler = routes[path];
			path = path
					.replace(/\//g, '\\/')
					.replace(/:(\w+)/g, '([^\\/]+)');
			var re = new RegExp('^' + path + '$');
			var captures = url.pathname.match(re);
			if (captures) {
				var args = [req, res].concat(captures.slice(1));
				routeHandler.apply(null, args);
				return;
			}
		}
		next();
	}
};
