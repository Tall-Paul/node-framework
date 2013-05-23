var framework = require(process.cwd()+'/framework/framework.js');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
 var sys = require('sys');
 var qs = require('querystring');
 var sha1 = require('sha1');
 

	passport.serializeUser(function(user,done){
		sys.puts("user serialization");
    	done(null, user);
	});
	passport.deserializeUser(function(obj,done){
		sys.puts("user deserialization");
		framework.parser.assign("user",obj);
    	done(null,obj);
	});



passport.use(new LocalStrategy(
  function(username, password, done) {
  	//sys.puts("in authenticate function");
  	var hash = sha1(password);
  	sys.puts("hash: "+hash);
    framework.models['base_user'].find({where:  {username: username, password_hash: hash} }).success(function(user){
      if (!user) {
        return done(null, false, { message: 'Unable to login' });
      }      
      return done(null, user);
    });
  }
));

exports.handle = function(id,site,request,response){
		sys.puts(JSON.stringify(request.session));
		//sys.puts("login handler called");
		//TODO: need some way of assigning variables before template functions run.
		//framework.parser.assign("post_id","1");
		sys.puts('isAuth?: ' + request.isAuthenticated()); 
		if (request.method == 'POST'){
			var body='';
				request.on('data', function (data) {
					body +=data;
				});
				request.on('end',function(){
					request.body =  qs.parse(body);
					passport.authenticate('local',{},function(foo,user,message){
						if (user == false){
							framework.parser.assign("login_message","Unable to login, please try again");
							framework.parser.display_file(process.cwd()+"/sites/"+site+"/www/templates/common/login.html",response); 
						} else {									
							request.logIn(user, function(err) {
      							if (err) { return next(err); }
      								framework.parser.assign("login_message","Authenticated");
      								framework.parser.assign("user",user);
      								framework.router.next_handler(id-1,site,request,response);
      								//return next(request);
      								//return framework.parser.display_file(process.cwd()+"/sites/"+site+"/www/templates/common/login.html",response); 
   							});							
							//user logged in okay
							//if requested url is 'login' then redirect to /
							//else redirect to the actual requested page by calling framework.router.next_handler with an id of 0, so the handlers run again
						}						
					})
					(request,response,function(){
							sys.puts("authentication callback");
					});						
				});
		} else {
			//sys.puts("parsing: "+process.cwd()+"/sites/"+site+"/www/templates/common/login.html");
			response.writeHeader(200);
			framework.parser.assign("login_message","Enter Credentials to login");
			framework.parser.display_file(process.cwd()+"/sites/"+site+"/www/templates/common/login.html",response); 
		}
}