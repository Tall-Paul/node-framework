var framework = require(process.cwd()+'/framework/framework.js');
var sys = require('sys');

exports.handle = function(id,site,request,response){
	if (framework.isLoggedIn(id,site,request,response)){
		sys.puts(response.user);
		framework.parser.display_file(process.cwd()+"/sites/"+site+"/www/templates/admin/index.html",response);
	}	
}