var sys = require("sys");
var fs = require("fs")
var url = require("url");
var path = require("path");
var framework = require(process.cwd()+'/framework/framework.js');


if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

var inArray = function (needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}


var router = module.exports = function(site_directory){
	this.sitesfile = site_directory+"/sites.json";
	this.routesfile = site_directory+"/routes.json";	
	this.load_routes();
}


router.prototype = {
	sitesfile: "",
	routesfile: "",
	routes: Array(),
	sites: Array(),

	show_routes:  function(){
		this.routes.forEach(function(route){
			sys.puts("site: ["+route.site+"] startswith: ["+route.startswith+"] endswith: ["+route.endswith+"] handler: ["+route.handler+"]");
		});
	},

	load_routes: function(){
		sites = Array();
		var that = this;
		fs.readFile(this.routesfile,function(err,data){
			if (err) {
				return sys.puts("Unable to build routes!!");
			}
			that.routes = JSON.parse(data);
			sys.puts("Routes Built from "+that.routesfile);
			//that.show_routes();
		});
	},

	save_routes: function(){
	fs.writeFile(this.routesfile,JSON.stringify(this.routes),function(error){
			if (error){
				return sys.puts("unable to save routes");
			}
			sys.puts("Routes saved");
		});
	},

	add_route:  function(site,startswith, endswith, handler){
		this.routes.push({"site":site,"startswith":startswith,"endswith":endswith,"handler":handler});
		this.show_routes();
	},

	call_handler: function(site,handler_name,request,response){
		var parts = handler_name.split("_");
		handler_name = "./packages/"+parts[0]+"/handlers/"+parts[1]+".js";
		var handler = require(handler_name);
		handler.handle(site,request,response);
	},

	get_object: function(object_name,query_string,request,response){
		var parts = object_name.split("_");
		object_name = "./packages/"+parts[0]+"/objects/"+parts[1]+".js";
		var object = require(object_name);
		object.search(query_string,request,response);
	},


	handle: function(request,response){
		//work out which site we're looking at here
		var site = "default";

		var request_path = url.parse(request.url).pathname;
		if (request_path == "/")
			request_path = "index.html";
		var my_path = "sites/"+site+"/www"+request_path;
   		var full_path = path.join(process.cwd(),my_path);
		var handler = "";
		var that = this;
		//object loader
		if (request_path.startsWith("/object/")){ //TODO:  fix query string handling
			var obj = request_path.substring(8);
			if (inArray(obj,framework.objects)) //special handler for this in package/models
				this.get_object(obj,"post_id=1",request,response);
			else {
				framework.models[obj].find({where: url.parse(request.url).query}).success(function(post){
					response.writeHead( 200 );
        			response.write(JSON.stringify(post));
        			response.end();
				});
			}
			return;
		}
		//overrides
		if (request_path == "/js/framework.js"){
        	full_path = process.cwd()+"/framework/packages/base/client/framework.js";
    	} 
		fs.exists(full_path,function(exists){
			if (exists){
				sys.puts(full_path);
				fs.readFile(full_path, "binary", function(err, file) {    
                 if(err) {    
                     response.writeHeader(500, {"Content-Type": "text/plain"});    
                     response.write(err + "\n");    
                     response.end();    
		         }    
                 else
		 		 {  
                    response.writeHeader(200);    
                    response.write(file, "binary");    
                    response.end();  
                 }          
	           });  
			} else {
				//routing table stuff goes here
				handler = "base_404";
				that.routes.forEach(function(route){
					if (request_path.startsWith(route.startswith) && request_path.endsWith(route.endswith))
						handler = route.handler;
				});
				if (handler == "base_404"){
					var template = process.cwd()+"/sites/"+site+"/www/404.html";
					var file = fs.readFileSync(template,"binary");
        			response.writeHeader(404, {"Content-Type": "text/plain"});   
        			response.write(file,"binary");    
        			response.end();  
				} else {
					that.call_handler(site,handler,request,response);
				}
			}
		});	
	},

}