var framework = require(process.cwd()+'/framework/framework.js');
var sys = require("sys");
var url = require("url");

exports.handle = function(id,site,request,response){	
		//TODO: need some way of assigning variables before template functions run.
		//framework.parser.assign("post_id","1");
		var page = url.parse(request.url).pathname;
		if (page == "/")
			page = "/index.html";	
		framework.models["pages_page"].find({where: {path: page}}).success(function(page){
			if (page == null){ 
				//sys.puts("calling next handler from page handler");
				framework.router.next_handler(id,site,request,response); 
			}
			else{
				framework.parser.assign("handler_page",page);
				//sys.puts("page handler hit");
				framework.parser.display_file(process.cwd()+"/sites/"+site+"/www/templates/pages/page.html",response); 
			}
		});	
		       
		
}