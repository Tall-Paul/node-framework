var http = require('http');
var sys = require('sys');
var fs = require('fs');
var router_class = require('./router.js');
var parser_class = require(process.cwd()+'/framework/parser.js');

var Sequelize = require('sequelize-mysql').sequelize
var mysql     = require('sequelize-mysql').mysql
var sequelize = null;
var models = Array;
var parser = null;
var router = null;
var objects = [];




var connect_to_database = function(){
	fs.readFile(process.cwd()+"/sites/db.json",function(err,data){
		if (err) {
				return sys.puts("Unable to get database connection details");
		}
		var connection = JSON.parse(data);
		sequelize = new Sequelize(connection.database, connection.username, connection.password,{
			dialect: "mysql"
		});
		sys.puts("##### Loading models #####");
		for_all_packages(function(package){
			sync_package_models(package);
		});

	});
}

var for_all_packages = function(callback){
	fs.readdir(process.cwd()+"/framework/packages", function(err, files) {
		files.forEach(function(file){
			callback(file);
		});
	});
}

// models
var sync_model = function(model_file,model_name){
	sys.puts("Loading: "+model_file+" as "+model_name);
	models[model_name] = sequelize.import(model_file);
	models[model_name].sync();
	//create default tags
	parser.assign("get_"+model_name,function(text){
			return client_get_object("blog_post",text);
	});
}

var sync_package_models = function(package){
	var model_dir = process.cwd()+"/framework/packages/"+package+"/models";
	fs.readdir(model_dir, function(err, files) {
		if (err) return;
		files.forEach(function(file){
			sync_model(model_dir+"/"+file,package+"_"+file.substring(0,file.length - 3));
		});

	});
}

//tags

var load_package_tags = function(package){
	var tag_dir = process.cwd()+"/framework/packages/"+package+"/tags";
	fs.readdir(tag_dir, function(err, files) {
		if (err) return;
		files.forEach(function(file){
			tag_name = package+"_"+file.substring(0,file.length - 3);
			tag_class = require(tag_dir+"/"+file);
			parser.assign(tag_name,tag_class.tag());
		});

	});
}

var cache_package_objects = function(package){
	var object_dir = process.cwd()+"/framework/packages/"+package+"/objects";
	fs.readdir(object_dir, function(err, files) {
		if (err) return;
		files.forEach(function(file){
			object_name = package+"_"+file.substring(0,file.length - 3);
			objects.push(object_name);
		});
	});
}

var do_common_assign = function(){
	parser.assign("js_includes","<script src='http://code.jquery.com/jquery-1.9.1.min.js'></script><script src='/js/framework.js'></script>");
}

var client_get_object = function(obj,text){

	query = query_from_commas(text);
	var prefix = query['prefix'];
	var query = "id="+query['id'];	
	return "<script>$(document).ready(function(){ framework_get_object('"+obj+"','"+query+"','"+prefix+"') })</script>";
}

var query_from_commas = function(text){
	var parts = text.split(",");
	obj = {};
	parts.forEach(function(item){
		parts2 = item.split('=');
		obj[parts2[0]] = parts2[1];
	});
	return obj;
}
 exports.client_get_object = client_get_object;



exports.startServer =  function(port){
	sys.puts("##### Loading Routes... #####");
	router = new router_class(process.cwd()+"/sites");
	parser = new parser_class();
	sys.puts("##### Connecting to Database #####");
	connect_to_database();
	sys.puts('##### Loading tags #####');
	
	for_all_packages(function(package){
		load_package_tags(package);
		cache_package_objects(package);
	});
	do_common_assign();


	exports.models = models;
	exports.parser = parser;
	exports.router = router;
	exports.objects = objects;

	http.createServer(function (req, res) {		
		  router.handle(req,res);
	}).listen(port);
	sys.puts("server started on "+port);
};
