var express = require('express');
var mongoose = require('mongoose');

var Degree = require('./models/degree.js');
var Course = require('./models/course.js');
var User = require('./models/user.js');
var Tag = require('./models/tag.js');

module.exports = function(app, passport) {

	//set the public/ directory as static
	app.use('/public', express.static('public'));


	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs', { user: req.user, nav: 'Home'}); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

    // process the schedule form
    //
    // ====================================
    // SCHEDULE SECTION====================
    // ====================================
    // schedule is dependent on user so must be logged in
    app.get('/schedule', isLoggedIn, function(req, res) {
        res.render('schedule.ejs', {
            user : req.user, nav: 'Map'
        });
    });

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


  app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/setup', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

  // process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));


	app.get('/setup', function(req, res){

			Degree.find({}, function(err, degrees){
				var reqCourses = degrees[0].courseGroups[0].courses;
				res.render('setup.ejs', {user: req.user, reqCourses: reqCourses});
			});


	});

	app.post('/setup', function(req, res){
		console.log('setup submit: '+JSON.stringify(req.body));
			res.redirect('/schedule');
	});

	app.get('/admin', function(req, res){
			res.render('admin.ejs', {user: req.user});
	});

	app.post('/admin', function(req, res){
		//console.log('admin submit: '+JSON.stringify(req.body));
		var degree_data = JSON.parse(req.body.degree_data);
		var course_data = JSON.parse(req.body.course_data);

		var degrees = degree_data.degrees;
		for(var i=0;i<degrees.length;i++) {
			var degreeObject = new Degree();
			degreeObject.shortname = degrees[i].shortname;
			degreeObject.name = degrees[i].name;
			degreeObject.courseGroups = degrees[i].coursegroups;
			degreeObject.save();
		}

		var tags = degree_data.tags;

		for(var i=0;i<course_data.length;i++) {
			var obj = course_data[i];
			var dept = obj.abbreviation;
			var courses = obj.courses;
			for(var j=0;j<courses.length;j++) {
				var c = courses[j];

				var courseObject = new Course();
				courseObject.name = c.name;
				courseObject.number = dept + ' '+c.number;

				if(courseObject.number.length<=9) {
					if(c.block>0) {
						tags['block_'+c.block].push(courseObject.number);
					}

					courseObject.save();
				}
			}
		}

		for(var key in tags) {
			var tagObject = new Tag();
			tagObject.key = key;
			tagObject.courses = tags[key];
			tagObject.save();
		}

		res.redirect('/');
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
