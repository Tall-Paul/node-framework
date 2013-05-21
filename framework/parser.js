var http = require('http')
  , util = require('util')
  , mu   = require('amulet')
  , sys = require("sys")
  , fs = require("fs");

var parser = module.exports = function(){		
	sys.puts("##### Parser initialised #####");
}

parser.prototype = {

	view: {},

	test_string: "",

	clear: function(){
		sys.puts("##### clearing view #####");
		this.view = {};
		this.renderer = {};
	},

	assign: function(tag,data){
		sys.puts("Assigning "+data+" to "+tag);
		this.view[tag] = data;
	},

	render_object: function(obj,prefix){
		var json_string = JSON.stringify(obj);
		return "<script>$(document).ready(function(){framework_load_object_ajax('"+json_string+"','"+prefix+"')});</script>";
	},

	display_file: function(filename,response){
		//var that = this;
		//fs.readFile(filename, function(err, file) {
		//	var display = mu.render(file, that.view);
		//	response.writeHeader(200);    
        //	response.write(display);    
        //	response.end(); 
		//});
		

		//var stream = mu.compileAndRender(filename,this.view)
		//stream.pipe(response);
		//stream.on('end', function() {
        //	response.end();
    	//});
		this.response = response;

		var renderer = mu.render(this.response,[filename],this.view,true,function(){
			sys.puts(filename+" rendered");
		});
		this.renderer = renderer;
		
		this.filename = filename;
	},

	extend: function(tag_name,data){
		var cont = {};
		cont[tag_name] = data;
		this.renderer.extendContext(cont);
		//this.assign(tag,data);
		//this.renderer.force();
	},


	debug_tags: function(){
		sys.puts(JSON.stringify(this.view));
	},



}

