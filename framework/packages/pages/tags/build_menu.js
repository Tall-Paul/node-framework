var framework = require(process.cwd()+'/framework/framework.js');
exports.tag = function(){
		return function(){
		var return_str = "";
		framework.models["pages_page"].findAll().success(function(pages){
			pages.forEach(function(page){
				return_str = return_str + "<li><a href='"+page.path+"'/>"+page.name+"</a></li>";
			});
			framework.parser.assign("pages_menu",return_str,true);
		});
		
		return " ";
	}
}