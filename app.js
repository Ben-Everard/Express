/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
//app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/helloExpress');

//var users = ['joe', 'jeff', 'sally', 'sarah', 'kim', 'john', 'jane'];

var UserSchema = new mongoose.Schema({
	 name: String,
	email: String,
	  age: Number
}),
	Users = mongoose.model('Users', UserSchema);

//Index
app.get('/users', function (req, res){
	Users.find({}, function (err, docs){
		res.render('users/index', { users: docs });
	});
});

//New
app.get('/users/new', function (req, res){
	res.render('users/new');
});

//Create
app.post('/users', function (req, res){
	var b = req.body
	new Users({
		name: b.name,
		email: b.email,
		age: b.age
	}).save(function (err, user){
		if (err) res.json(err);
		res.redirect('/users/' + user.name);
	});
});

//Finds the user where :name is called in the url
app.param('name', function (req, res, next, name){
	Users.find({name: name}, function (err, docs){
		req.user = docs[0];
		next();
	});
});

//Show
app.get('/users/:name', function (req, res){
	res.render("users/show", { user: req.user} );
});

//Edit
app.get('/users/:name/edit', function (req, res){
	console.log('This is the edit page')
	res.render('users/edit', { user: req.user });
});

//Update
app.put('/users/:name', function (req, res){
	console.log('Update Function');
	var b = req.body;
	Users.update(
		{ name: req.params.name },
		{ name: b.name, age: b.age, email: b.email },
		function(err){
			if (err) res.json(err);
			res.redirect('/users/' + b.name);
		});
})

//Destroy
app.delete('/users/:name', function (req, res){
	Users.remove({ name: req.params.name}, function(err){
		res.redirect('/users');
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
