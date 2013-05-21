var sys = require("sys");
var fs = require("fs")
var url = require("url");
var path = require("path");
var framework = require(process.cwd()+'/framework/framework.js');

(function() {
  // Define StopIteration as part of the global scope if it
  // isn't already defined.
  if(typeof StopIteration == "undefined") {
    StopIteration = new Error("StopIteration");
  }

  // The original version of Array.prototype.forEach.
  var oldForEach = Array.prototype.forEach;

  // If forEach actually exists, define forEach so you can
  // break out of it by throwing StopIteration.  Allow
  // other errors will be thrown as normal.
  if(oldForEach) {
    Array.prototype.forEach = function() {
      try {
        oldForEach.apply(this, [].slice.call(arguments, 0));
      }
      catch(e) {
        if(e !== StopIteration) {
          throw e;
        }
      }
    };
  }
})();


if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
  	if (str == "*")
  		return true;
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
  	if (str == "*")
  		return true;
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
			that.show_routes();
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

	call_handler: function(id,site,handler_name,request,response){
		var parts = handler_name.split("_");
		handler_name = "./packages/"+parts[0]+"/handlers/"+parts[1]+".js";
		var handler = require(handler_name);
		handler.handle(id,site,request,response);
	},

	get_object: function(object_name,query_string,request,response){
		var parts = object_name.split("_");
		object_name = "./packages/"+parts[0]+"/objects/"+parts[1]+".js";
		var object = require(object_name);
		object.search(query_string,request,response);
	},

	next_handler: function(current_id,site,request,response){
		var request_path = url.parse(request.url).pathname;
		if (request_path == "/")
			request_path = "index.html";
		var that = this;
		this.routes.forEach(function(route){
			//sys.puts("next_handler "+current_id+":"+route.id);
			if (request_path.startsWith(route.startswith) && request_path.endsWith(route.endswith) && route.id > current_id){
				that.call_handler(route.id,site,route.handler,request,response);
				throw StopIteration; //break us out of the loop
			}
		});
		this.handle_404(site,request,response);
	},

	handle_404: function(site,request,response){
		response.writeHeader(404, {"Content-Type": "text/html"});
		var template = process.cwd()+"/sites/"+site+"/www/404.html";
		framework.parser.display_file(template,response);
	},

	handle_static: function(full_path,request,response){
		if (path.extname(full_path) == ".html"){
			response.writeHeader(404, {"Content-Type": "text/html"});
			framework.parser.display_file(full_path,response);
		} else {
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
	     }
	},


	handle: function(request,response){
		//work out which site we're looking at here
		var site = "default";
		framework.parser.set_root(process.cwd()+"/sites/default/www/templates/");
		var request_path = url.parse(request.url).pathname;
		if (request_path == "/")
			request_path = "index.html";
		var my_path = "sites/"+site+"/www"+request_path;
   		var full_path = path.join(process.cwd(),my_path);
   		var root_path = path.join(process.cwd(),"sites/"+site+"/www");
   		if (!full_path.startsWith(root_path)){
   			this.handle_404(site,request,response);
   			return;
   		}
		var handler = "";
		var that = this;
		//object loader
			if (request_path.startsWith("/object/")){ //TODO:  fix query string handling
			var obj = request_path.substring(8);
			if (inArray(obj,framework.objects)) //special handler for this in package/models
				this.get_object(obj,"post_id=1",request,response);
			else {
				framework.models[obj].find(url.parse(request.url).id).success(function(post){
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
				that.handle_static(full_path,request,response);				  
			} else {
				var handled = false;
				//routing table stuff goes here								v
				that.routes.forEach(function(route){
					if (request_path.startsWith(route.startswith) && request_path.endsWith(route.endswith)){	
						handled = true;					
						that.call_handler(route.id,site,route.handler,request,response);						
						throw StopIteration;
					}
				});				
				if (handled == false){
					that.handle_404(site,request,response);
				}
			}
		});	
	},

}