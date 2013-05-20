var framework = require(process.cwd()+'/framework/framework.js');
exports.tag = function(){
		return function(text){
			return framework.client_get_object("blog_post",text);
		};
}