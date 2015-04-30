var connect = require('connect');
var Cookies = require('cookies');
var bodyParser = require('body-parser');
var fs = require('fs');
var busboy = require('connect-busboy');
var mkdirp = require('mkdirp');
var logger = require('./logger');
var query = require('connect-query');

function cookieLogger() {
	return function logCookies(req, res) {
		console.log('logCookies');
		var unsigned = req.cookies.get( "unsigned" )
		var signed = req.cookies.get( "signed", { signed: true } )
		var tampered = req.cookies.get( "tampered", { signed: true } )

		res.writeHead( 200, { "Content-Type": "text/plain" } )
		res.end(
			"unsigned expected: foo\n\n" +
			"unsigned actual: " + unsigned + "\n\n" +
			"signed expected: bar\n\n" +
			"signed actual: " + signed + "\n\n" +
			"tampered expected: undefined\n\n"+
			"tampered: " + tampered + "\n\n"
		)
	}
}

function hello(req, res, next) {
	res.end('hello\n');
}

function setCookies(req, res) {
	res.cookies
      // set a regular cookie
      .set( "unsigned", "foo", { httpOnly: false } )

      // set a signed cookie
      .set( "signed", "bar", { signed: true } )

      // mimic a signed cookie, but with a bogus signature
      .set( "tampered", "baz" )
      .set( "tampered.sig", "bogus" )

    res.writeHead( 302, { "Location": "/logCookies" } )
    return res.end( "Now let's check." )
}

function parseBody(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.write('received body:\n');
	res.end(JSON.stringify(req.body, null, 2));
}

function parseQuery(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.write('received query:\n');
	res.end(JSON.stringify(req.query, null, 2));
}

function uploadFile(req, res) {
	mkdirp.sync(__dirname + '/uploads/');
	var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        fstream = fs.createWriteStream(__dirname + '/uploads/' + filename);
		file.pipe(fstream);	
        fstream.on('close', function () {
            res.end();
        });
		file.on('limit', function(){
			res.end('File has been truncated!');
		})
    });
}

connect()
	.use(logger(':method :url'))
	.use(Cookies.connect(['secret11']))
	.use(query())
	.use('/setCookies', setCookies)
	.use('/logCookies', cookieLogger())
	//https://www.npmjs.com/package/body-parser
	.use(bodyParser.urlencoded({ extended: false, limit: '100kb' })) //Use number to specify bytes e.g. limit: 100
	.use(bodyParser.json({ limit: '100kb' })) //Use number to specify bytes e.g. limit: 100
	.use('/bodyParser', parseBody)
	.use(busboy({ // https://www.npmjs.com/package/busboy
		limits: {
			fileSize: 10 * 1024
		}
	}))
	.use('/fileUpload', uploadFile)
	.use('/queryParser', parseQuery)
	.listen(3000);

