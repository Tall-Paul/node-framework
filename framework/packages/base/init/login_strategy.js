var framework = require(process.cwd()+'/framework/framework.js');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    framework.models['base_user'].findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.password == "testing") {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));