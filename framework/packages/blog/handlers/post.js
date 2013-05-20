
var framework = require(process.cwd()+'/framework/framework.js');
var sys = require("sys");

exports.handle = function(site,request,response){	
		//TODO: need some way of assigning variables before template functions run.
		framework.parser.assign("post_id","1");
		framework.parser.assign("test_2","testing");
		framework.parser.display_file(process.cwd()+"/sites/"+site+"/www/templates/blog/post.html",response);         
}