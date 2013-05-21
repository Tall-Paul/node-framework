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
	running: 0,
	test_string: "",
	root: "",

	clear: function(){
		mu.emptyCache();
	},

	assign: function(tag,data){
		if (this.running == 0)
			this.view[tag] = data;
		else {
			var cont = {};
			cont[tag] = data;
			this.renderer.extendContext(cont);
		}
	},

	set_root: function(path){
		mu.set("root",path)
	},

	render_object: function(obj,prefix){
		var json_string = JSON.stringify(obj);
		return "<script>$(document).ready(function(){framework_load_object_ajax('"+json_string+"','"+prefix+"')});</script>";
	},

	display_file: function(filename,response){		
		this.running = 1;
		var that = this;
			this.renderer = mu.render(response,[filename],this.view,true,function(){
				that.running = 0;	
				that.clear();
			});		
	},



	debug_tags: function(){
		sys.puts(JSON.stringify(this.view));
	},



}

