var User = require('mongoose').model('User');
	passport = require('passport');

var getErrorMessage = function(err) {
	var message = '';
 	if (err.code) {
 		switch (err.code) {
 			case 11000:
 			case 11001:
 			message = 'Username already exists';
 			break;
 			default:
 			message = 'Something went wrong';
 		}
 	} else {
 		for (var errName in err.errors) {
 		if (err.errors[errName].message) message = err.errors[errName].
		message;
 	}
}
	return message;
};

exports.renderSignin = function(req, res, next) {
    if (!req.user) {
        res.render('signin', {
            title: 'Sign-in Form',
            messages: req.flash('error') || req.flash('info')
        });
    } else {
        return res.redirect('/');
    }
};

exports.renderSignup = function(req, res, next) {
 	if (!req.user) {
 		res.render('signup', {
 			title: 'Sign-up Form',
 			messages: req.flash('error')
 		});
 	} else {
 		return res.redirect('/');
 	}
};

exports.signup = function(req, res, next) {
 	if (!req.user) {
 		var user = new User(req.body);
 		var message = null;
 		user.provider = 'local';
 		user.save(function(err) {
 			if (err) {
 				var message = getErrorMessage(err);
 				req.flash('error', message);
 				return res.redirect('/signup');
 			}

 			req.login(user, function(err) {
 				if (err) return next(err);
 				return res.redirect('/');
 			});
 		});
 	} else {
 		return res.redirect('/');
 	}
};

exports.signout = function(req, res) {
	req.logout();
 	res.redirect('/');
};

exports.saveOAuthUserProfile = function(req, profile, done) {
	// User.findOne({provider: profile.provider, providerId: profile.providerId}, function(err, user) {
 // 		if (err) {
 // 			return done(err);
 // 		} else {
 // 			if (!user) {
 // 				var possibleUsername = profile.username || ((profile.email) ? profile.email.split('@')[0] : '');
 // 				User.findUniqueUsername(possibleUsername, null,
 // 				function(availableUsername) {
 // 				 	profile.username = availableUsername;
 // 					user = new User(profile);
 // 					user.save(function(err) {
	// 		 			if (err) {
	// 		 				var message = getErrorMessage(err);
	// 		 				req.flash('error', message);
	// 		 				//return res.redirect('/signup');
	// 		 			}
 // 						return done(err, user);
 // 					});
 // 				});
	// 		} else {
 // 				return done(err, user);
 // 			}
 // 		}
 // 	});

User.findOne({$or:[{ 'facebook.id' : profile.id },{ 'twitter.id' : profile.id }]}, function(err, user) {
        if (err)
            return done(err);
        if (user) {
            return done(null, user); 
            var newUser            = new User();
            newUser.facebook.id    = profile.id;                 
            newUser.facebook.token = token; 
            newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; 
            newUser.facebook.email = profile.emails[0].value; 

            newUser.save(function(err) {
                if (err)
                    throw err;
                return done(null, newUser);
            });
        }
    });
};

exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}
	next();
};

exports.hasAuthorization = function(req, res, next) {
	if (req.article.creator.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};