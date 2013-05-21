var framework = require(process.cwd()+'/framework/framework.js');
var sys = require("sys");

exports.handle = function(id,site,request,response){	
		//TODO: need some way of assigning variables before template functions run.
		//framework.parser.assign("post_id","1");
		sys.puts("in dummy handler");
		//framework.parser.display_file(process.cwd()+"/sites/"+site+"/www/templates/pages/page.html",response); 
		framework.router.next_handler(id,site,request,response);        
}