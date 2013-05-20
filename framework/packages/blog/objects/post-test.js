var framework = require(process.cwd()+'/framework/framework.js');
var sys = require("sys");
var url = require("url");

exports.search = function(query_string,request,response){
	framework.models['blog_post'].find(1).success(function(post){
			response.writeHead( 200 );
        	response.write(JSON.stringify(post));
        	response.end();
	});
}
